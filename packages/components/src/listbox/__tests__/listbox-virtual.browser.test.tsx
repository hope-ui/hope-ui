import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Listbox } from "../index";

// Phase-4 virtual mode, in a real browser: the same `createListbox` state windowed over a huge data
// set. Only a slice of rows mounts, yet selection/focus/typeahead/form-submission all work over the
// **full** set. There is no strict hydration round-trip here (a windowed list can't be byte-identical
// server↔client — see `listbox-virtual.ssr.test.tsx`); the collection-mode `Tree` owns that DoD.

function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

interface Row {
  id: number;
  name: string;
}

const COUNT = 10_000;
// One row deep in the list carries a distinctive label, to prove typeahead reaches an **offscreen**
// row via `itemToLabel` (an unmounted row has no `textContent` to fall back to).
const ZEBRA_INDEX = 800;

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    name: index === ZEBRA_INDEX ? "Zebra" : `Item ${index}`,
  }));
}

const itemToValue = (row: Row) => String(row.id);
const itemToLabel = (row: Row) => row.name;

interface VirtualListboxProps {
  count?: number;
  selectionMode?: "single" | "multiple" | "none";
  focusMode?: "roving" | "activedescendant";
}

function VirtualListbox(props: VirtualListboxProps): JSX.Element {
  const rows = makeRows(props.count ?? COUNT);
  return (
    <Themed>
      <Listbox.Root
        aria-label="virtual rows"
        items={rows}
        estimateSize={() => 32}
        overscan={5}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        selectionMode={props.selectionMode}
        focusMode={props.focusMode}
        // A real viewport height + scroll so only a window mounts. Inline, not the recipe class: the
        // browser test project loads no compiled Tailwind, so the CSS must be inline to take effect.
        style={{ height: "256px", "overflow-y": "auto" }}
      >
        {(row: Row, index: Accessor<number>) => (
          <Listbox.Item index={index} data-value={row.name} style={{ height: "32px" }}>
            <Listbox.ItemIndicator />
            {row.name}
          </Listbox.Item>
        )}
      </Listbox.Root>
    </Themed>
  );
}

// ─── Queries ────────────────────────────────────────────────────────────────────────────────────

function nth<T>(list: ArrayLike<T>, index: number): T {
  const value = list[index];
  if (value == null) {
    throw new Error(`no element at index ${index}`);
  }
  return value;
}
function listbox(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="listbox"]') as HTMLElement;
}
function options(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>('[role="option"]')];
}
/** The indices of the rows actually mounted (the window), sorted. */
function mountedIndices(container: HTMLElement): number[] {
  return [...container.querySelectorAll<HTMLElement>("[data-index]")]
    .map((element) => Number(element.dataset.index))
    .sort((a, b) => a - b);
}
function selectedIndices(container: HTMLElement): number[] {
  return options(container)
    .filter((element) => element.getAttribute("aria-selected") === "true")
    .map((element) => Number(element.dataset.index));
}

// ─── Windowing ──────────────────────────────────────────────────────────────────────────────────

describe("Listbox virtual — windowing", () => {
  it("mounts only a window of the full set, each row a role=option carrying data-index", async () => {
    const { container, dispose } = mount(() => <VirtualListbox />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    const mounted = mountedIndices(container);
    // A slice, never all 10k.
    expect(mounted.length).toBeGreaterThan(0);
    expect(mounted.length).toBeLessThan(50);

    // Virtual mode uses role-based generic elements (see Root's JSDoc): a `<div role="listbox">`
    // scroll container over `<div role="option">` rows, each keyed by `data-index`.
    const list = listbox(container);
    expect(list.getAttribute("role")).toBe("listbox");
    expect(list.getAttribute("data-slot")).toBe("listbox");
    expect(container.querySelector('[data-slot="listbox-sizer"]')).not.toBeNull();
    for (const option of options(container)) {
      expect(option.getAttribute("role")).toBe("option");
      expect(option.hasAttribute("data-index")).toBe(true);
    }
    // A far-offscreen row is not in the DOM at all.
    expect(mounted).not.toContain(COUNT - 1);

    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Roving focus into an unmounted region (deferred focus) ─────────────────────────────────────

describe("Listbox virtual — roving over unmounted rows", () => {
  it("End scrolls the last (offscreen) row into the window, then focuses it", async () => {
    const { container, dispose } = mount(() => <VirtualListbox />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    // Enter the list at the first row (roving focus lands on it).
    await userEvent.click(nth(options(container), 0));
    await expect.element(nth(options(container), 0)).toHaveFocus();

    const last = COUNT - 1;
    expect(mountedIndices(container)).not.toContain(last);

    await userEvent.keyboard("{End}");
    // The kernel scrolls the target into view first, then focuses it once its element mounts — the
    // deferred-focus path that makes roving over a virtualized list work.
    await vi.waitFor(() =>
      expect(container.querySelector(`[data-index="${last}"]`)).not.toBeNull(),
    );
    await expect
      .element(container.querySelector<HTMLElement>(`[data-index="${last}"]`) as HTMLElement)
      .toHaveFocus();
    dispose();
  });
});

// ─── Typeahead over the full set ────────────────────────────────────────────────────────────────

describe("Listbox virtual — typeahead", () => {
  it("jumps the active row to an offscreen match resolved from itemToLabel", async () => {
    const { container, dispose } = mount(() => <VirtualListbox />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    // The distinctive "Zebra" row is far offscreen — it has no rendered `textContent` to match, so
    // this only works because typeahead reads `itemToLabel` over the full set.
    expect(mountedIndices(container)).not.toContain(ZEBRA_INDEX);

    await userEvent.click(nth(options(container), 0)); // focus the list (roving)
    await userEvent.keyboard("z"); // → "Zebra"

    await vi.waitFor(() => {
      const zebra = container.querySelector<HTMLElement>(`[data-index="${ZEBRA_INDEX}"]`);
      expect(zebra).not.toBeNull(); // scrolled into the window
      expect(zebra?.hasAttribute("data-active")).toBe(true); // and made the single active row
    });
    dispose();
  });
});

// ─── Selection over the full set + native form submission ───────────────────────────────────────

describe("Listbox virtual — selection & form submission", () => {
  function FormVirtualListbox(props: { onSubmit: (data: FormData) => void }): JSX.Element {
    const rows = makeRows(COUNT);
    return (
      <Themed>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            props.onSubmit(new FormData(event.currentTarget));
          }}
        >
          <Listbox.Root
            aria-label="virtual rows"
            items={rows}
            estimateSize={() => 32}
            selectionMode="multiple"
            name="row"
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            style={{ height: "256px", "overflow-y": "auto" }}
          >
            {(row: Row, index: Accessor<number>) => (
              <Listbox.Item index={index} data-value={row.name} style={{ height: "32px" }}>
                {row.name}
              </Listbox.Item>
            )}
          </Listbox.Root>
          <button type="submit">Submit</button>
        </form>
      </Themed>
    );
  }

  it("multiple selection submits the selected rows' itemToValue strings as hidden fields", async () => {
    let submitted: FormData | undefined;
    const { container, dispose } = mount(() => (
      <FormVirtualListbox onSubmit={(data) => (submitted = data)} />
    ));
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    // Toggle the first two windowed rows on (indices 0 and 1 at scrollTop 0).
    await userEvent.click(nth(options(container), 0));
    await userEvent.click(nth(options(container), 1));
    await vi.waitFor(() =>
      expect(selectedIndices(container).sort((a, b) => a - b)).toEqual([0, 1]),
    );

    // The hidden fields are siblings of the scroll container, never inside it.
    expect(listbox(container).querySelector('input[type="hidden"]')).toBeNull();

    await userEvent.click(page.getByRole("button", { name: "Submit" }));
    await vi.waitFor(() => expect(submitted).toBeDefined());
    expect((submitted as FormData).getAll("row").sort()).toEqual(["0", "1"]);
    dispose();
  });
});

// ─── Page navigation (the reported bug) ─────────────────────────────────────────────────────────

describe("Listbox virtual — page navigation", () => {
  it("PageDown jumps by a page into offscreen rows, and arrow keys keep working afterward", async () => {
    const { container, dispose } = mount(() => <VirtualListbox />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    await userEvent.click(nth(options(container), 0)); // enter at row 0 (roving)
    await expect.element(nth(options(container), 0)).toHaveFocus();

    // Two PageDowns (default page = 10) reach index 20 — offscreen for the ~8-row viewport. The kernel
    // scrolls it in and focuses it; PageDown must NOT fall through to a native scroll that unmounts the
    // focused row and drops focus (the reported failure).
    await userEvent.keyboard("{PageDown}{PageDown}");
    await vi.waitFor(() => {
      const row = container.querySelector<HTMLElement>('[data-index="20"]');
      expect(row).not.toBeNull();
      expect(row?.hasAttribute("data-active")).toBe(true);
    });
    await expect
      .element(container.querySelector<HTMLElement>('[data-index="20"]') as HTMLElement)
      .toHaveFocus();

    // The regression the report describes: after Page keys, arrows would stop working. They don't.
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() =>
      expect(
        container.querySelector<HTMLElement>('[data-index="21"]')?.hasAttribute("data-active"),
      ).toBe(true),
    );
    dispose();
  });
});

// ─── Activedescendant references a mounted option ───────────────────────────────────────────────

describe("Listbox virtual — activedescendant", () => {
  it("points aria-activedescendant at a mounted option after End — never a dangling IDREF", async () => {
    const { container, dispose } = mount(() => <VirtualListbox focusMode="activedescendant" />);
    await vi.waitFor(() => expect(mountedIndices(container).length).toBeGreaterThan(0));

    const list = listbox(container);
    expect(list.getAttribute("tabindex")).toBe("0");
    list.focus();
    await expect.element(list).toHaveFocus();

    await userEvent.keyboard("{End}"); // active → last (offscreen); the kernel scrolls it in first

    await vi.waitFor(() => {
      const activeId = list.getAttribute("aria-activedescendant");
      expect(activeId).toBeTruthy();
      // The IDREF must resolve to a **mounted** option — never dangle at an unrendered row.
      const active = container.querySelector(`[id="${activeId}"]`);
      expect(active).not.toBeNull();
      expect(active?.getAttribute("role")).toBe("option");
    });
    // Focus never leaves the container in activedescendant mode.
    await expect.element(list).toHaveFocus();
    for (const option of options(container)) {
      expect(option).not.toHaveFocus();
    }
    await expectNoA11yViolations(container);
    dispose();
  });
});
