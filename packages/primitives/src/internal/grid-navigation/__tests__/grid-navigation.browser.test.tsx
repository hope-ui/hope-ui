import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { type Accessor, createMemo, createSignal, For } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  type CollectionItem,
  type CreateCollectionReturn,
  createCollection,
} from "../../collection/collection";
import {
  type CreateListFocusReturn,
  createListFocus,
  type FocusMode,
} from "../../list-focus/list-focus";
import {
  type CreateGridNavigationReturn,
  createGridNavigation,
  type GridCell,
  type GridWrap,
} from "../grid-navigation";

interface CellDesc {
  value: string;
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  disabled?: boolean;
}

interface GridApi {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
  grid: CreateGridNavigationReturn;
}

function Cell(props: { api: GridApi; desc: CellDesc }) {
  const [ref, setRef] = createSignal<HTMLDivElement>();
  const item: CollectionItem<string> = props.api.collection.register({
    ref,
    value: () => props.desc.value,
    disabled: () => props.desc.disabled ?? false,
  });
  return (
    <div
      ref={setRef}
      id={item.id}
      role="gridcell"
      data-value={props.desc.value}
      aria-disabled={props.desc.disabled ? "true" : undefined}
      tabindex={props.api.focus.getItemTabIndex(item)}
      onClick={() => props.api.focus.focus(item)}
    >
      {props.desc.value}
    </div>
  );
}

function GridHarness(props: {
  descs: CellDesc[];
  rowWrap?: Accessor<GridWrap>;
  colWrap?: Accessor<GridWrap>;
  focusMode?: Accessor<FocusMode>;
  onNavigateBefore?: () => void;
  onNavigateAfter?: () => void;
  onReady: (api: GridApi) => void;
}) {
  const collection = createCollection<string>();
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const focus = createListFocus<string>({
    source: collection,
    element: containerRef,
    focusMode: props.focusMode,
  });
  const descByValue = new Map(props.descs.map((desc) => [desc.value, desc]));
  const cells = createMemo<GridCell<string>[]>(() =>
    collection.items().map((item) => {
      const desc = descByValue.get(item.value()) as CellDesc;
      return {
        item,
        rowIndex: desc.row,
        colIndex: desc.col,
        rowSpan: desc.rowSpan,
        colSpan: desc.colSpan,
      };
    }),
  );
  const grid = createGridNavigation<string>({
    focus,
    cells,
    rowWrap: props.rowWrap,
    colWrap: props.colWrap,
    onNavigateBefore: props.onNavigateBefore,
    onNavigateAfter: props.onNavigateAfter,
  });
  props.onReady({ collection, focus, grid });

  const rows = [...new Set(props.descs.map((d) => d.row))].sort((a, b) => a - b);
  return (
    <div
      ref={setContainerRef}
      role="grid"
      aria-label="grid"
      tabindex={focus.getListTabIndex()}
      aria-activedescendant={focus.activeDescendant()}
      onKeyDown={grid.onKeyDown}
    >
      <For each={rows}>
        {(row) => (
          <div role="row">
            <For each={props.descs.filter((d) => d.row === row).sort((a, b) => a.col - b.col)}>
              {(desc) => <Cell api={{ collection, focus, grid }} desc={desc} />}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}

/** A dense R×C grid of "r-c" values. */
function uniformGrid(rowCount: number, colCount: number): CellDesc[] {
  const descs: CellDesc[] = [];
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) descs.push({ value: `${row}-${col}`, row, col });
  }
  return descs;
}

function cell(container: HTMLElement, value: string): HTMLElement {
  return container.querySelector<HTMLElement>(`[data-value="${value}"]`) as HTMLElement;
}
function itemByValue(
  api: { collection: CreateCollectionReturn<string> },
  value: string,
): CollectionItem<string> {
  const found = api.collection.items().find((item) => item.value() === value);
  if (!found) throw new Error(`no registered cell with value ${value}`);
  return found;
}

describe("createGridNavigation — 2D movement", () => {
  it("moves between cells with the arrow keys", async () => {
    let api!: GridApi;
    const { container, dispose } = mount(() => (
      <GridHarness descs={uniformGrid(3, 3)} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(9));

    api.focus.focus(itemByValue(api, "0-0"));
    await expect.element(cell(container, "0-0")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect.element(cell(container, "0-1")).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(cell(container, "1-1")).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.element(cell(container, "1-0")).toHaveFocus();
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(cell(container, "0-0")).toHaveFocus();
    dispose();
  });

  it("stops at edges when both axes are nowrap", async () => {
    let api!: GridApi;
    const { container, dispose } = mount(() => (
      <GridHarness descs={uniformGrid(3, 3)} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(9));

    api.focus.focus(itemByValue(api, "0-2"));
    await expect.element(cell(container, "0-2")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}"); // at last column, nowrap → stays
    await expect.element(cell(container, "0-2")).toHaveFocus();
    dispose();
  });

  it("crosses into the next row when colWrap is continuous", async () => {
    let api!: GridApi;
    const continuous = () => "continuous" as const;
    const { container, dispose } = mount(() => (
      <GridHarness descs={uniformGrid(3, 3)} colWrap={continuous} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(9));

    api.focus.focus(itemByValue(api, "0-2"));
    await expect.element(cell(container, "0-2")).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}"); // past last column → first cell of next row
    await expect.element(cell(container, "1-0")).toHaveFocus();
    dispose();
  });

  it("Home/End move within the row, mod+Home/mod+End to the grid ends", async () => {
    let api!: GridApi;
    const { container, dispose } = mount(() => (
      <GridHarness descs={uniformGrid(3, 3)} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(9));

    api.focus.focus(itemByValue(api, "1-1"));
    await userEvent.keyboard("{End}");
    await expect.element(cell(container, "1-2")).toHaveFocus();
    await userEvent.keyboard("{Home}");
    await expect.element(cell(container, "1-0")).toHaveFocus();

    await userEvent.keyboard("{Control>}{End}{/Control}");
    await expect.element(cell(container, "2-2")).toHaveFocus();
    await userEvent.keyboard("{Control>}{Home}{/Control}");
    await expect.element(cell(container, "0-0")).toHaveFocus();
    dispose();
  });

  it("skips a disabled cell", async () => {
    let api!: GridApi;
    // 0-1 disabled.
    const descs = uniformGrid(1, 3).map((d) => (d.col === 1 ? { ...d, disabled: true } : d));
    const { container, dispose } = mount(() => (
      <GridHarness descs={descs} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(3));

    api.focus.focus(itemByValue(api, "0-0"));
    await userEvent.keyboard("{ArrowRight}"); // 0-1 disabled → lands on 0-2
    await expect.element(cell(container, "0-2")).toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: GridApi;
    const { container, dispose } = mount(() => (
      <GridHarness descs={uniformGrid(3, 3)} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(9));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createGridNavigation — spans", () => {
  it("steps past a cell's own span and lands on a spanning neighbor", async () => {
    // Row 0: [wide (col 0-1, colSpan 2)] [0-2].  Row 1: [1-0] [1-1] [1-2].
    const descs: CellDesc[] = [
      { value: "wide", row: 0, col: 0, colSpan: 2 },
      { value: "0-2", row: 0, col: 2 },
      { value: "1-0", row: 1, col: 0 },
      { value: "1-1", row: 1, col: 1 },
      { value: "1-2", row: 1, col: 2 },
    ];
    let api!: GridApi;
    const { container, dispose } = mount(() => (
      <GridHarness descs={descs} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(5));

    api.focus.focus(itemByValue(api, "wide"));
    // Right from the wide cell skips its 2-column span, landing on 0-2 (not an intermediate slot).
    await userEvent.keyboard("{ArrowRight}");
    await expect.element(cell(container, "0-2")).toHaveFocus();

    // Down from 1-1 up into the wide cell: it covers slot (0,1), resolving to the wide anchor.
    api.focus.focus(itemByValue(api, "1-1"));
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(cell(container, "wide")).toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const descs: CellDesc[] = [
      { value: "wide", row: 0, col: 0, colSpan: 2 },
      { value: "0-2", row: 0, col: 2 },
    ];
    let api!: GridApi;
    const { container, dispose } = mount(() => (
      <GridHarness descs={descs} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(2));
    await expectNoA11yViolations(container);
    dispose();
  });
});

describe("createGridNavigation — roving vs activedescendant", () => {
  it("uses aria-activedescendant and keeps cells untabbable in AD mode", async () => {
    let api!: GridApi;
    const ad = () => "activedescendant" as const;
    const { container, dispose } = mount(() => (
      <GridHarness descs={uniformGrid(2, 2)} focusMode={ad} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));

    const grid = container.querySelector('[role="grid"]') as HTMLElement;
    grid.focus();
    api.focus.focus(itemByValue(api, "1-1"));

    await vi.waitFor(() =>
      expect(grid.getAttribute("aria-activedescendant")).toBe(cell(container, "1-1").id),
    );
    expect(grid.getAttribute("tabindex")).toBe("0");
    expect(cell(container, "1-1").getAttribute("tabindex")).toBe("-1");
    await expect.element(grid).toHaveFocus();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: GridApi;
    const ad = () => "activedescendant" as const;
    const { container, dispose } = mount(() => (
      <GridHarness descs={uniformGrid(2, 2)} focusMode={ad} onReady={(a) => (api = a)} />
    ));
    await vi.waitFor(() => expect(api.collection.items()).toHaveLength(4));
    await expectNoA11yViolations(container);
    dispose();
  });
});

// ─── Calendar-like harness: the vertical edge flips the month via onNavigateBefore/After ────────

interface CalendarApi {
  collection: CreateCollectionReturn<string>;
  focus: CreateListFocusReturn<string>;
  grid: CreateGridNavigationReturn;
  month: Accessor<number>;
  counters: { before: number; after: number };
}

function CalendarHarness(props: { onReady: (api: CalendarApi) => void }) {
  // 3 rows × 3 "days" per month; ArrowDown on the last row flips to the next month, ArrowUp on the
  // first row to the previous — the Astryx `useGridFocus` month-flip pattern.
  const [month, setMonth] = createSignal(0);
  const counters = { before: 0, after: 0 };
  const days = createMemo<CellDesc[]>(() => {
    const list: CellDesc[] = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) list.push({ value: `m${month()}-${row}-${col}`, row, col });
    }
    return list;
  });

  const collection = createCollection<string>();
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const focus = createListFocus<string>({ source: collection, element: containerRef });
  const cells = createMemo<GridCell<string>[]>(() => {
    const byValue = new Map(days().map((d) => [d.value, d]));
    return collection.items().map((item) => {
      const desc = byValue.get(item.value()) as CellDesc;
      return { item, rowIndex: desc.row, colIndex: desc.col };
    });
  });

  const landOnNewMonth = (row: number) =>
    queueMicrotask(() => {
      const target = collection.items().find((i) => i.value() === `m${month()}-${row}-0`);
      if (target) focus.focus(target);
    });

  const grid = createGridNavigation<string>({
    focus,
    cells,
    onNavigateAfter: () => {
      counters.after += 1;
      setMonth((m) => m + 1);
      landOnNewMonth(0); // continue at the top row of the next month
    },
    onNavigateBefore: () => {
      counters.before += 1;
      setMonth((m) => m - 1);
      landOnNewMonth(2); // continue at the bottom row of the previous month
    },
  });
  props.onReady({ collection, focus, grid, month, counters });

  return (
    <div
      ref={setContainerRef}
      role="grid"
      aria-label="calendar"
      tabindex={focus.getListTabIndex()}
      onKeyDown={grid.onKeyDown}
    >
      <For each={[0, 1, 2]}>
        {(row) => (
          <div role="row">
            <For each={days().filter((d) => d.row === row)}>
              {(desc) => {
                const [ref, setRef] = createSignal<HTMLDivElement>();
                const item = collection.register({ ref, value: () => desc.value });
                return (
                  <div
                    ref={setRef}
                    id={item.id}
                    role="gridcell"
                    data-value={desc.value}
                    tabindex={focus.getItemTabIndex(item)}
                  >
                    {desc.value}
                  </div>
                );
              }}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}

describe("createGridNavigation — calendar month-flip callbacks", () => {
  it("flips to the next month on ArrowDown past the last row and lands on it", async () => {
    let api!: CalendarApi;
    const { container, dispose } = mount(() => <CalendarHarness onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(container.querySelectorAll("[data-value]").length).toBe(9));

    api.focus.focus(itemByValue(api, "m0-2-1"));
    await expect.element(cell(container, "m0-2-1")).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}"); // past the bottom → onNavigateAfter → month 1
    await vi.waitFor(() => expect(api.counters.after).toBe(1));
    await vi.waitFor(() => expect(cell(container, "m1-0-0")).not.toBeNull());
    await expect.element(cell(container, "m1-0-0")).toHaveFocus();
    expect(api.month()).toBe(1);
    dispose();
  });

  it("flips to the previous month on ArrowUp past the first row", async () => {
    let api!: CalendarApi;
    const { container, dispose } = mount(() => <CalendarHarness onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(container.querySelectorAll("[data-value]").length).toBe(9));

    api.focus.focus(itemByValue(api, "m0-0-2"));
    await userEvent.keyboard("{ArrowUp}"); // past the top → onNavigateBefore → month -1
    await vi.waitFor(() => expect(api.counters.before).toBe(1));
    expect(api.month()).toBe(-1);
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    let api!: CalendarApi;
    const { container, dispose } = mount(() => <CalendarHarness onReady={(a) => (api = a)} />);
    await vi.waitFor(() => expect(container.querySelectorAll("[data-value]").length).toBe(9));
    await expectNoA11yViolations(container);
    dispose();
  });
});
