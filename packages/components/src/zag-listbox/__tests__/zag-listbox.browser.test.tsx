import ssrFixture from "virtual:hydration-fixture?id=zag-listbox";
import { Listbox } from "@hope-ui/components/listbox";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { collection } from "@zag-js/listbox";
import { For, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { ZagListbox } from "../index";
import { FRUITS, type Fruit, fruitCollection, Tree } from "./zag-listbox.ssr-entry";

// **Not a port of `listbox.browser.test.tsx`.** Feature parity and machine correctness were settled
// by the ZagDialog spike; re-porting 544 lines would re-measure axes already scored. This file is an
// *instrument* for the one open question — does the Solid-idiom seam cost less the second time? — so
// it holds exactly four things: the anatomy under `mount()` (whose STRICT_READ_UNTRACKED /
// REACTIVE_WRITE_IN_OWNED_SCOPE guard **is** the seam measurement), the collection-vs-DOM divergence
// probe, a keyboard/typeahead smoke test, and the `getItemProps` churn measurement.
// See `__internal__/spikes/zag-listbox-findings.md`.

function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

function FullListbox(props: { hide?: string }): JSX.Element {
  return (
    <Themed>
      <ZagListbox.Root collection={fruitCollection} defaultValue={["banana"]}>
        <ZagListbox.Label>Fruits</ZagListbox.Label>
        <ZagListbox.Content>
          <For each={fruitCollection.items}>
            {(item) => (
              <Show when={item.value !== props.hide}>
                <ZagListbox.Item item={item}>
                  <ZagListbox.ItemText>{item.label}</ZagListbox.ItemText>
                  <ZagListbox.ItemIndicator />
                </ZagListbox.Item>
              </Show>
            )}
          </For>
        </ZagListbox.Content>
      </ZagListbox.Root>
    </Themed>
  );
}

/** The machine defers its DOM-touching effects behind `raf` and its events behind a microtask. */
async function settle(): Promise<void> {
  for (let frame = 0; frame < 3; frame++) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

describe("ZagListbox anatomy", () => {
  it("renders the full anatomy through the shared listbox recipe", async () => {
    const { container, dispose } = mount(() => <FullListbox />);

    const listbox = container.querySelector<HTMLElement>('[role="listbox"]');
    expect(listbox).not.toBeNull();
    // The recipe's `root` slot lands on `Content`, not on Zag's `root` wrapper — that wrapper is the
    // one extra DOM node the Zag anatomy adds, and no recipe slot fits it.
    expect(listbox?.className).toContain("overflow-y-auto");
    expect(container.querySelector('[data-slot="zag-listbox-root"]')).not.toBeNull();

    const options = container.querySelectorAll<HTMLElement>('[role="option"]');
    expect(options).toHaveLength(FRUITS.length);
    expect(options[1]?.getAttribute("aria-selected")).toBe("true");
    expect(options[3]?.getAttribute("aria-disabled")).toBe("true");

    // The one override the shared recipe forces: `data-active`, re-derived from `highlightedValue`
    // because Zag emits `data-highlighted` on a focus-visibility-dependent condition instead.
    listbox?.focus();
    await userEvent.keyboard("{ArrowDown}");
    await settle();
    expect(options[0]?.hasAttribute("data-active")).toBe(true);

    // The indicator is `<Show>`-gated, not `hidden`-driven — Zag's `hidden: !selected` loses to the
    // recipe's `display: flex`, so exactly one indicator element exists at all.
    expect(container.querySelectorAll('[data-slot="zag-listbox-item-indicator"]')).toHaveLength(1);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("selects on click and reports Zag's own payload shape", async () => {
    let lastValue: string[] | undefined;
    const { container, dispose } = mount(() => (
      <Themed>
        <ZagListbox.Root
          collection={fruitCollection}
          onValueChange={(details) => {
            lastValue = details.value;
          }}
        >
          <ZagListbox.Label>Fruits</ZagListbox.Label>
          <ZagListbox.Content>
            <For each={fruitCollection.items}>
              {(item) => <ZagListbox.Item item={item}>{item.label}</ZagListbox.Item>}
            </For>
          </ZagListbox.Content>
        </ZagListbox.Root>
      </Themed>
    ));

    const options = container.querySelectorAll<HTMLElement>('[role="option"]');
    await userEvent.click(options[0] as HTMLElement);
    await vi.waitFor(() => expect(lastValue).toEqual(["apple"]));
    expect(options[0]?.getAttribute("aria-selected")).toBe("true");

    dispose();
  });

  it("dangles aria-labelledby when no Label is rendered", async () => {
    // ZagDialog's `C1`, recurring verbatim: `getContentProps()` emits `aria-labelledby` pointing at
    // `listbox:<id>:label` whether or not that element exists, and no prop turns it off. A consumer
    // naming the list with `aria-label` alone still ships a broken IDREF — axe raises
    // `aria-valid-attr-value` (critical). Pinned rather than papered over; the fix is the same
    // override-getter shape ZagDialog identified and neither spike took.
    const { container, dispose } = mount(() => (
      <Themed>
        <ZagListbox.Root collection={fruitCollection}>
          <ZagListbox.Content aria-label="Fruits">
            <For each={fruitCollection.items}>
              {(item) => <ZagListbox.Item item={item}>{item.label}</ZagListbox.Item>}
            </For>
          </ZagListbox.Content>
        </ZagListbox.Root>
      </Themed>
    ));

    const labelledBy =
      container.querySelector('[role="listbox"]')?.getAttribute("aria-labelledby") ?? "";
    expect(labelledBy).toMatch(/:label$/);
    expect(document.getElementById(labelledBy)).toBeNull();
    await expectNoA11yViolations(container, {
      // Not an "axe cannot decide" allowance — the markup is genuinely wrong, and this call site
      // exists to record that. See the comment above.
      allowIncomplete: ["aria-valid-attr-value"],
    });

    dispose();
  });

  it("navigates onto a collection item that is not rendered", async () => {
    // **The functional probe.** With a collection *prop* the machine navigates over collection DATA
    // (`getNextValue` is a pure index walk), never over rendered DOM — so a `<Show>`-gated row is
    // still a navigation stop. Not fatal: navigation continues straight past it. The cost is a
    // dangling `aria-activedescendant` for as long as the missing row is highlighted.
    const { container, dispose } = mount(() => <FullListbox hide="banana" />);

    const listbox = container.querySelector<HTMLElement>('[role="listbox"]');
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(FRUITS.length - 1);

    listbox?.focus();
    await userEvent.keyboard("{ArrowDown}");
    await settle();
    expect(listbox?.getAttribute("aria-activedescendant")).toContain(":item:apple");

    await userEvent.keyboard("{ArrowDown}");
    await settle();
    const dangling = listbox?.getAttribute("aria-activedescendant") ?? "";
    expect(dangling).toContain(":item:banana");
    expect(document.getElementById(dangling)).toBeNull();

    await userEvent.keyboard("{ArrowDown}");
    await settle();
    const resolved = listbox?.getAttribute("aria-activedescendant") ?? "";
    expect(resolved).toContain(":item:cherry");
    expect(document.getElementById(resolved)).not.toBeNull();

    dispose();
  });

  it("moves the active row with arrows and with typeahead", async () => {
    const { container, dispose } = mount(() => <FullListbox />);
    const listbox = container.querySelector<HTMLElement>('[role="listbox"]');
    const options = container.querySelectorAll<HTMLElement>('[role="option"]');

    listbox?.focus();
    await userEvent.keyboard("{ArrowDown}");
    await settle();
    expect(options[0]?.hasAttribute("data-active")).toBe(true);

    await userEvent.keyboard("{ArrowDown}");
    await settle();
    expect(options[1]?.hasAttribute("data-active")).toBe(true);

    // Typeahead jumps to Cherry. Both it and arrow navigation walk the **collection**, skipping
    // disabled entries — `Date` is unreachable by either, exactly as hope's `skipDisabled` does it.
    await userEvent.keyboard("c");
    await settle();
    expect(options[2]?.hasAttribute("data-active")).toBe(true);

    await userEvent.keyboard("{ArrowDown}");
    await settle();
    expect(options[3]?.hasAttribute("data-active")).toBe(false);

    dispose();
  });
});

// ── The granularity measurement ──────────────────────────────────────────────────────────────────
//
// The axis-10 claim is that a snapshot-shaped `connect()` recomputes `getItemProps(item)` per item
// per state change — O(N) where Solid's fine-grained updates would be O(1). A 200-item list is what
// exposes it; Dialog's seven singleton parts could not.
//
// Two counters, both supplied by the *test*, so neither component is modified:
//
//  - `classReads` — the consumer `class` prop. Solid compiles `class={expr}` to a getter, and both
//    stacks read `props.class` inside their item's own `class` computation, which that element's
//    spread effect re-reads whenever the effect re-runs. So it counts the same thing on both sides:
//    **how many item prop-set reads happened.** This is the symmetric number.
//  - `itemToValue` — the collection identity fn. On the Zag side `getItemState` calls it on every
//    `getItemProps`/`getItemTextProps`/`getItemIndicatorProps`, so it *is* the `getItemProps` count
//    the spike brief asks for. hope's `itemToValue` is a different function on a different contract;
//    its number is reported, not equated.
//
// Exact figures (and the per-row decomposition) are in the findings ledger. The assertions here are
// bounded rather than pinned — the *shape* is the finding, and an exact count would be a brittle pin
// on Zag internals.

const ITEM_COUNT = 200;

const BIG_ITEMS: Fruit[] = Array.from({ length: ITEM_COUNT }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index}`,
}));

interface Counters {
  classReads: number;
  itemToValue: number;
}

const countClass = (counters: Counters): string => {
  counters.classReads++;
  return "";
};

function BigZagListbox(props: { counters: Counters }): JSX.Element {
  const big = collection({
    items: BIG_ITEMS,
    itemToValue: (item: Fruit) => {
      props.counters.itemToValue++;
      return item.value;
    },
    itemToString: (item: Fruit) => item.label,
  });
  return (
    <Themed>
      <ZagListbox.Root collection={big}>
        <ZagListbox.Label>Big</ZagListbox.Label>
        <ZagListbox.Content>
          <For each={big.items}>
            {(item) => (
              <ZagListbox.Item item={item} class={countClass(props.counters)}>
                {item.label}
              </ZagListbox.Item>
            )}
          </For>
        </ZagListbox.Content>
      </ZagListbox.Root>
    </Themed>
  );
}

function BigHopeListbox(props: { counters: Counters }): JSX.Element {
  return (
    <Themed>
      <Listbox.Root
        aria-label="Big"
        itemToValue={(item: string) => {
          props.counters.itemToValue++;
          return item;
        }}
      >
        <For each={BIG_ITEMS}>
          {(item) => (
            <Listbox.Item value={item.value} class={countClass(props.counters)}>
              {item.label}
            </Listbox.Item>
          )}
        </For>
      </Listbox.Root>
    </Themed>
  );
}

/** Mounts, warms up past the first highlight, then reports what one arrow move and one Enter cost. */
async function profile(ui: () => JSX.Element, counters: Counters) {
  const { container, dispose } = mount(ui);
  const listbox = container.querySelector<HTMLElement>('[role="listbox"]') as HTMLElement;
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(ITEM_COUNT);

  listbox.focus();
  await userEvent.keyboard("{ArrowDown}");
  await settle();

  const run = async (keys: string) => {
    counters.classReads = 0;
    counters.itemToValue = 0;
    await userEvent.keyboard(keys);
    await settle();
    return { ...counters };
  };

  const arrow = await run("{ArrowDown}");
  const select = await run("{Enter}");
  dispose();
  return { arrow, select };
}

describe(`granularity — ${ITEM_COUNT} items`, () => {
  it("costs Zag about one item-state rebuild per row, in line with hope", async () => {
    const zagCounters: Counters = { classReads: 0, itemToValue: 0 };
    const zag = await profile(() => <BigZagListbox counters={zagCounters} />, zagCounters);

    const hopeCounters: Counters = { classReads: 0, itemToValue: 0 };
    const hopeResult = await profile(
      () => <BigHopeListbox counters={hopeCounters} />,
      hopeCounters,
    );

    // **Both stacks re-read every row's prop set** — Solid's `spread` is one effect per element that
    // reads *all* of that element's props, and every row subscribes to the shared active signal
    // through its own `data-active`. So the "O(N) vs O(1)" half of the axis-10 prediction does not
    // survive measurement: hope is O(N) here too, at 1 read per row against Zag's 2.
    expect(zag.arrow.classReads).toBeGreaterThanOrEqual(ITEM_COUNT);
    expect(hopeResult.arrow.classReads).toBeGreaterThanOrEqual(ITEM_COUNT);

    // The *cost* of each of those reads used to be the whole finding: 40 collection lookups per row
    // per keystroke, because every key of the merged item props re-invoked `getItemProps` and each
    // call rebuilt the item's full state. Memoizing each `mergeProps` source (the adapter rewrite)
    // collapsed that to ~1 per row — the same order as hope, whose getters are id comparisons that
    // never touch the collection at all on a move.
    expect(zag.arrow.itemToValue).toBeLessThan(6 * ITEM_COUNT);
    expect(zag.select.itemToValue).toBeLessThan(6 * ITEM_COUNT);
    expect(hopeResult.arrow.itemToValue).toBe(0);
    expect(hopeResult.select.itemToValue).toBeLessThan(2 * zag.select.itemToValue);
  });
});

describe("ZagListbox hydration", () => {
  it("hydrates the server tree without a mismatch across every item", () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    expect(container.querySelectorAll('[role="option"]')).toHaveLength(FRUITS.length);
    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
