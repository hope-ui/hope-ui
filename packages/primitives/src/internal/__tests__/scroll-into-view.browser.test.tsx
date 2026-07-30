import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { For } from "solid-js";
import { describe, expect, it } from "vitest";
import { scrollIntoView } from "../scroll-into-view";

const ROW = 30;
const VIEWPORT = 90; // exactly three rows
const COUNT = 10; // 300px of content, 210px of scroll range

interface ListProps {
  containerStyle?: JSX.CSSProperties;
  rowStyle?: JSX.CSSProperties;
}

/** A vertically scrolling list: ten 30px rows inside a 90px port. */
function VerticalList(props: ListProps): JSX.Element {
  return (
    <div
      data-testid="scroller"
      tabindex={0}
      style={{
        height: `${VIEWPORT}px`,
        "overflow-y": "auto",
        ...props.containerStyle,
      }}
    >
      <For each={Array.from({ length: COUNT }, (_, index) => index)}>
        {(index) => (
          <div data-index={index} style={{ height: `${ROW}px`, ...props.rowStyle }}>
            Row {index}
          </div>
        )}
      </For>
    </div>
  );
}

/** The same list on the inline axis: ten 30px columns inside a 90px port. */
function HorizontalList(): JSX.Element {
  return (
    <div
      data-testid="scroller"
      tabindex={0}
      style={{ width: `${VIEWPORT}px`, "overflow-x": "auto", display: "flex" }}
    >
      <For each={Array.from({ length: COUNT }, (_, index) => index)}>
        {(index) => (
          <div data-index={index} style={{ flex: `0 0 ${ROW}px`, height: `${ROW}px` }}>
            {index}
          </div>
        )}
      </For>
    </div>
  );
}

function scroller(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-testid="scroller"]') as HTMLElement;
}
function row(container: HTMLElement, index: number): HTMLElement {
  return container.querySelector(`[data-index="${index}"]`) as HTMLElement;
}

describe("scrollIntoView — block axis", () => {
  it("reveals a clipped row by the minimum distance in either direction", async () => {
    const { container, dispose } = mount(() => <VerticalList />);
    const list = scroller(container);

    // Row 4 spans [120, 150) and the port is [0, 90): the shorter correction is the bottom edge.
    scrollIntoView(list, row(container, 4));
    expect(list.scrollTop).toBe(150 - VIEWPORT);

    // Coming back up, the shorter correction is the top edge — row 0 lands flush, not centered.
    scrollIntoView(list, row(container, 0));
    expect(list.scrollTop).toBe(0);

    await expectNoA11yViolations(container);
    dispose();
  });

  it("does nothing when the row is already fully inside the port", () => {
    const { container, dispose } = mount(() => <VerticalList />);
    const list = scroller(container);

    list.scrollTop = 60;
    scrollIntoView(list, row(container, 3)); // [90, 120) — the middle of the visible band
    expect(list.scrollTop).toBe(60);
    dispose();
  });

  it("honors start / center / end alignment", () => {
    const { container, dispose } = mount(() => <VerticalList />);
    const list = scroller(container);

    scrollIntoView(list, row(container, 4), { block: "start" });
    expect(list.scrollTop).toBe(120);

    list.scrollTop = 0;
    scrollIntoView(list, row(container, 4), { block: "center" });
    expect(list.scrollTop).toBe(120 + ROW / 2 - VIEWPORT / 2);

    list.scrollTop = 0;
    scrollIntoView(list, row(container, 4), { block: "end" });
    expect(list.scrollTop).toBe(150 - VIEWPORT);
    dispose();
  });

  it("keeps the container's scroll-padding out of the port", () => {
    const { container, dispose } = mount(() => (
      <VerticalList containerStyle={{ "scroll-padding-block-start": "20px" }} />
    ));
    const list = scroller(container);

    // Row 2 is flush with the top of the *box* but under the 20px scroll-padding, so it is not yet
    // inside the *port* — without the padding this call would be a no-op.
    list.scrollTop = 60;
    scrollIntoView(list, row(container, 2));
    expect(list.scrollTop).toBe(40);
    dispose();
  });

  it("keeps the row's scroll-margin outside the port", () => {
    const { container, dispose } = mount(() => (
      <VerticalList rowStyle={{ "scroll-margin-block-start": "20px" }} />
    ));
    const list = scroller(container);

    list.scrollTop = 60;
    scrollIntoView(list, row(container, 2));
    expect(list.scrollTop).toBe(40);
    dispose();
  });

  it("subtracts the container's border from the port", () => {
    const { container, dispose } = mount(() => <VerticalList />);
    const plain = scroller(container);

    // Baseline: with the whole 90px box scrollable, row 4 is already the last fully visible one.
    plain.scrollTop = 60;
    scrollIntoView(plain, row(container, 4));
    expect(plain.scrollTop).toBe(60);
    dispose();

    const bordered = mount(() => (
      <VerticalList
        containerStyle={{ "border-block-start": "10px solid black", "box-sizing": "border-box" }}
      />
    ));
    const list = scroller(bordered.container);

    // The border sits inside the box but outside the scroll port, leaving 80px — so the same row
    // now hangs 10px below the fold.
    list.scrollTop = 60;
    scrollIntoView(list, row(bordered.container, 4));
    expect(list.scrollTop).toBe(150 - (VIEWPORT - 10));
    bordered.dispose();
  });
});

describe("scrollIntoView — inline axis", () => {
  it("reveals a clipped column by the minimum distance", () => {
    const { container, dispose } = mount(() => <HorizontalList />);
    const list = scroller(container);

    scrollIntoView(list, row(container, 4));
    expect(list.scrollLeft).toBe(150 - VIEWPORT);

    scrollIntoView(list, row(container, 0));
    expect(list.scrollLeft).toBe(0);
    dispose();
  });
});

describe("scrollIntoView — containment", () => {
  it("scrolls only the given container, never an ancestor", () => {
    const { container, dispose } = mount(() => (
      <div data-testid="outer" tabindex={0} style={{ height: "60px", "overflow-y": "auto" }}>
        <VerticalList />
      </div>
    ));
    const outer = container.querySelector('[data-testid="outer"]') as HTMLElement;
    const list = scroller(container);

    // The list itself is clipped by `outer`, which a native `element.scrollIntoView()` would fix by
    // scrolling every ancestor — the behavior that drags the page out from under a popup.
    scrollIntoView(list, row(container, 9));
    expect(list.scrollTop).toBe(COUNT * ROW - VIEWPORT);
    expect(outer.scrollTop).toBe(0);
    dispose();
  });

  it("returns early when the container is the element", () => {
    const { container, dispose } = mount(() => <VerticalList />);
    const list = scroller(container);

    list.scrollTop = 45;
    scrollIntoView(list, list);
    expect(list.scrollTop).toBe(45);
    dispose();
  });
});
