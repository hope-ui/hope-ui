import ssrFixture from "virtual:hydration-fixture?id=popover";
import { expectNoA11yViolations, hydrateFixture, mount } from "@hope-ui/internal-test-utils";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Popover, type PopoverRootProps } from "../index";
import { Tree } from "./popover.ssr-entry";

// Popover reads a theme recipe, so every tree here needs a provider. It renders no DOM of its own
// (hope's token values live in CSS), so it changes nothing the assertions look at — except the
// hydration keys Solid assigns by walking the component tree, which is why the hydration tree below
// must carry it too.
function Themed(props: { children: JSX.Element }): JSX.Element {
  return <ThemeProvider preset={hope}>{props.children}</ThemeProvider>;
}

/**
 * Clear of every edge, so neither `flip` nor `shift` has anything to react to. The browser project's
 * viewport is **414×896** (measured, not the Playwright default), and every coordinate here is sized
 * against it: a trigger far enough right that a 200px layer aligned to its `start` edge overflowed
 * would make `flip`'s cross-axis check silently rewrite `data-align` to `end`.
 */
const TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "120px",
  width: "120px",
};

/** Far from the trigger, so "which element is the layer anchored to" is answerable from a rect. */
const ANCHOR_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "500px",
  left: "40px",
  width: "120px",
  height: "24px",
};

/**
 * Wider than the `md` card's `max-w-72` (288px) and than the 200px {@link POSITIONER_STYLE}, so a
 * layer that really tracks the anchor's width is unmistakably distinguishable from one that does not.
 * Still inside the 414px viewport, so nothing `shift`s.
 */
const WIDE_TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "40px",
  width: "320px",
};

/**
 * Hard against the inline-start edge and only 4px wide: `shift` pushes the card back inside the
 * `collisionPadding` gutter while the arrow can only travel to `arrowPadding`, so the arrow cannot
 * point at the anchor's centre and stays `data-uncentered`.
 */
const CLAMPED_TRIGGER_STYLE: JSX.CSSProperties = {
  position: "fixed",
  top: "200px",
  left: "0px",
  width: "4px",
};

/**
 * **This test project compiles no Tailwind**, so every recipe class is an inert string here. An
 * unstyled positioner is a block `<div>` as wide as the viewport, which makes floating-ui's `flip`
 * middleware fire on the cross axis and silently rewrite `data-align` to `end`. These two give the
 * layer and its arrow a real box so the measured assertions mean what they say — riding the
 * positioning-first / consumer-last `style` merge, the documented consumer override.
 */
const POSITIONER_STYLE: JSX.CSSProperties = { width: "200px" };
const ARROW_STYLE: JSX.CSSProperties = { width: "8px", height: "8px" };

/**
 * The exit transition, inline for the same reason as the two above: hope's `content` slot authors
 * `duration-150`, and that class is inert here.
 *
 * It is load-bearing, not decoration. The mount/unmount animation state reads the element's
 * *computed* transition duration and unmounts immediately when it is `0` — so without this the layer
 * is gone by the first frame after a close, `data-presence="exiting"` is never observable, and the
 * exit assertion below would quantify over an empty set.
 */
const TRANSITIONED_CONTENT_STYLE: JSX.CSSProperties = { transition: "opacity 150ms ease-out" };

interface PopoverDemoProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnFocusOutside?: boolean;
  side?: PopoverRootProps["side"];
  align?: PopoverRootProps["align"];
  matchAnchorWidth?: PopoverRootProps["matchAnchorWidth"];
  triggerStyle?: JSX.CSSProperties;
  /** Overrides {@link POSITIONER_STYLE} — the seam a test spends `--anchor-width` through. */
  positionerStyle?: JSX.CSSProperties;
  /** Give the card a real exit duration — see {@link TRANSITIONED_CONTENT_STYLE}. */
  contentStyle?: JSX.CSSProperties;
  /** Mount a `Popover.Anchor`, which outranks the trigger as the positioning reference. */
  withAnchor?: boolean;
  /** A focusable control inside the popup, before the CloseTrigger. */
  withInnerButton?: boolean;
  /** A focusable control after the popover, so Tab has somewhere to leave to. */
  withOutsideButton?: boolean;
}

// The canonical consumer tree — the same shape as the ssr-entry's, plus the knobs the behavior tests
// need. `Popover.Title` is not decoration: a `role="dialog"` surface with no accessible name fails
// the axe check every test here runs. Title/Description sit inside a `Popover.Header` so the
// labelling assertions double as proof that a title registers its id with the content from any
// nesting depth — the header is layout, not a link in the ARIA chain.
const PopoverDemo: Component<PopoverDemoProps> = (props) => (
  <Themed>
    <Popover.Root
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      closeOnFocusOutside={props.closeOnFocusOutside}
      side={props.side}
      align={props.align}
      matchAnchorWidth={props.matchAnchorWidth}
    >
      <Show when={props.withAnchor}>
        <Popover.Anchor data-testid="anchor" style={ANCHOR_STYLE}>
          anchor
        </Popover.Anchor>
      </Show>
      <Popover.Trigger style={props.triggerStyle ?? TRIGGER_STYLE}>Open popover</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner style={props.positionerStyle ?? POSITIONER_STYLE}>
          <Popover.Content style={props.contentStyle}>
            <Popover.Arrow style={ARROW_STYLE} />
            <Popover.Header>
              <Popover.Title>Popover title</Popover.Title>
              <Popover.Description>Popover description</Popover.Description>
            </Popover.Header>
            <Show when={props.withInnerButton}>
              <button type="button" data-testid="inner">
                inner
              </button>
            </Show>
            <Popover.CloseTrigger />
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
    <Show when={props.withOutsideButton}>
      <button type="button" data-testid="outside">
        outside
      </button>
    </Show>
  </Themed>
);

/** The parts portal into `document.body`, so every query runs against the document, not the mount container. */
const partOf = (slot: string) =>
  document.querySelector<HTMLElement>(`[data-slot="popover-${slot}"]`);

const triggerLocator = () => page.getByRole("button", { name: "Open popover" });

/**
 * Waits for the first measurement to land. Until it does, the layer is parked at 0,0 under
 * `visibility: hidden`; afterwards that key is gone from the style object and a real `translate()`
 * appears. Axe and every geometry assertion must wait, or they inspect the unpositioned layer.
 */
async function waitForPositioned(): Promise<HTMLElement> {
  let positioner: HTMLElement | null = null;
  await vi.waitFor(() => {
    positioner = partOf("positioner");
    expect(positioner).not.toBeNull();
    expect(positioner?.style.visibility).not.toBe("hidden");
    expect(positioner?.style.transform ?? "").toContain("translate(");
  });
  return positioner as unknown as HTMLElement;
}

/**
 * Axe reports `aria-valid-attr-value` as *incomplete* for **any** element carrying both
 * `aria-haspopup` and `aria-controls`, bailing out before it resolves the id reference at all —
 * undecidable by construction, not a markup problem. The reference itself is asserted directly below.
 */
const AXE_OPTIONS = { allowIncomplete: ["aria-valid-attr-value"] };

describe("Popover — open/close behavior", () => {
  it("opens on trigger click and closes on the second click", async () => {
    const { dispose } = mount(() => <PopoverDemo />);

    await userEvent.click(triggerLocator());
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // Without the trigger excluded from outside-click dismissal, the capture-phase pointerdown
    // dismisses and the trigger's own click reopens — an open popover could never be closed by the
    // control that opened it.
    await userEvent.click(triggerLocator());
    await vi.waitFor(() => expect(page.getByRole("dialog").query()).toBeNull());

    dispose();
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const { dispose } = mount(() => <PopoverDemo withInnerButton />);

    await userEvent.click(triggerLocator());
    await waitForPositioned();

    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(page.getByRole("dialog").query()).toBeNull());
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(triggerLocator().query() as HTMLElement),
    );

    dispose();
  });

  it("closes on an outside pointerdown", async () => {
    const { dispose } = mount(() => <PopoverDemo withOutsideButton />);

    await userEvent.click(triggerLocator());
    await waitForPositioned();

    await userEvent.click(page.getByTestId("outside"));
    await vi.waitFor(() => expect(page.getByRole("dialog").query()).toBeNull());

    dispose();
  });

  it("moves focus into the popup on open", async () => {
    const { dispose } = mount(() => <PopoverDemo withInnerButton />);

    await userEvent.click(triggerLocator());
    // Autofocus is gated on the first measurement: an element inside a `visibility: hidden` subtree
    // is not focusable, so focusing before it lands is a silent no-op.
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(page.getByTestId("inner").query() as HTMLElement),
    );

    dispose();
  });

  it("closes when focus leaves, but not when Shift+Tab lands back on the trigger", async () => {
    const { dispose } = mount(() => <PopoverDemo withInnerButton withOutsideButton />);

    await userEvent.click(triggerLocator());
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(page.getByTestId("inner").query() as HTMLElement),
    );

    // Back onto the trigger: excluded from "outside", so the layer stays open and `aria-expanded`
    // stays truthful.
    (triggerLocator().query() as HTMLElement).focus();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    await expect.element(triggerLocator()).toHaveAttribute("aria-expanded", "true");

    // Anywhere else closes it — a non-modal layer does not trap focus; leaving is what dismisses it.
    (page.getByTestId("outside").query() as HTMLElement).focus();
    await vi.waitFor(() => expect(page.getByRole("dialog").query()).toBeNull());

    dispose();
  });

  it("keeps the layer open on focus-out when closeOnFocusOutside is false", async () => {
    const { dispose } = mount(() => (
      <PopoverDemo withInnerButton withOutsideButton closeOnFocusOutside={false} />
    ));

    await userEvent.click(triggerLocator());
    await waitForPositioned();

    (page.getByTestId("outside").query() as HTMLElement).focus();
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    dispose();
  });

  it("closes from Popover.CloseTrigger", async () => {
    const { dispose } = mount(() => <PopoverDemo />);

    await userEvent.click(triggerLocator());
    await waitForPositioned();

    await userEvent.click(page.getByRole("button", { name: "Close" }));
    await vi.waitFor(() => expect(page.getByRole("dialog").query()).toBeNull());

    dispose();
  });

  it("reports open state on the trigger's ARIA, naming the popup only while it exists", async () => {
    const { dispose } = mount(() => <PopoverDemo />);

    const trigger = triggerLocator();
    await expect.element(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    // An `aria-controls` naming an element that isn't in the DOM is an invalid IDREF.
    expect((trigger.query() as HTMLElement).getAttribute("aria-controls")).toBeNull();

    await userEvent.click(trigger);
    const content = await vi.waitFor(() => {
      const element = partOf("content");
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
    expect((trigger.query() as HTMLElement).getAttribute("aria-controls")).toBe(content.id);

    dispose();
  });

  it("labels and describes the popup from Title and Description", async () => {
    const { dispose } = mount(() => <PopoverDemo defaultOpen />);

    const content = await vi.waitFor(() => {
      const element = partOf("content");
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(content.getAttribute("aria-labelledby")).toBe(partOf("title")?.id);
    expect(content.getAttribute("aria-describedby")).toBe(partOf("description")?.id);
    // Non-modal: the attribute is absent, not `"false"`.
    expect(content.getAttribute("aria-modal")).toBeNull();

    dispose();
  });

  it("has no accessibility violations while open", async () => {
    const { dispose } = mount(() => <PopoverDemo defaultOpen withInnerButton />);

    await waitForPositioned();
    await expectNoA11yViolations(document.body, AXE_OPTIONS);

    dispose();
  });
});

describe("Popover — positioning", () => {
  it("emits the same resolved data-side/data-align on the positioner, content and arrow", async () => {
    const { dispose } = mount(() => <PopoverDemo defaultOpen side="top" align="start" />);

    await waitForPositioned();
    for (const slot of ["positioner", "content", "arrow"]) {
      expect(partOf(slot)?.getAttribute("data-side"), slot).toBe("top");
      expect(partOf(slot)?.getAttribute("data-align"), slot).toBe("start");
    }

    dispose();
  });

  it("positions against a Popover.Anchor instead of the trigger when one is mounted", async () => {
    const { dispose } = mount(() => <PopoverDemo defaultOpen withAnchor />);

    const positioner = await waitForPositioned();
    const anchorRect = (page.getByTestId("anchor").query() as HTMLElement).getBoundingClientRect();
    const layerRect = positioner.getBoundingClientRect();

    // Anchored below the anchor (`side="bottom"` by default), not the trigger 300px away.
    expect(layerRect.top).toBeGreaterThan(anchorRect.bottom - 1);
    expect(Math.abs(layerRect.top - anchorRect.bottom)).toBeLessThan(24);

    dispose();
  });

  it("measures the arrow and drops data-uncentered once it can point at the anchor", async () => {
    const { dispose } = mount(() => <PopoverDemo defaultOpen />);

    await waitForPositioned();
    await vi.waitFor(() => {
      const arrow = partOf("arrow");
      // An offset written at all is proof the arrow's element reached floating-ui's config.
      expect(arrow?.style.left).not.toBe("");
      expect(arrow?.hasAttribute("data-uncentered")).toBe(false);
    });

    dispose();
  });

  it("keeps data-uncentered when the anchor is too narrow to point at honestly", async () => {
    const { dispose } = mount(() => (
      <PopoverDemo defaultOpen triggerStyle={CLAMPED_TRIGGER_STYLE} />
    ));

    await waitForPositioned();
    await vi.waitFor(() => expect(partOf("arrow")?.style.left).not.toBe(""));
    expect(partOf("arrow")?.hasAttribute("data-uncentered")).toBe(true);

    dispose();
  });

  it("publishes --anchor-width as real, spendable CSS — a layer sized from it matches the trigger", async () => {
    // Asserted through the consumer `style` prop rather than the recipe, because this project
    // compiles no Tailwind (see POSITIONER_STYLE). Spending the custom property directly is what
    // proves it holds a usable length: a malformed or missing value leaves the declaration invalid
    // and the width unchanged.
    const { dispose } = mount(() => (
      <PopoverDemo
        defaultOpen
        triggerStyle={WIDE_TRIGGER_STYLE}
        positionerStyle={{ width: "var(--anchor-width)" }}
      />
    ));

    const positioner = await waitForPositioned();
    const triggerRect = (triggerLocator().query() as HTMLElement).getBoundingClientRect();
    expect(positioner.getBoundingClientRect().width).toBeCloseTo(triggerRect.width, 1);

    dispose();
  });

  it("puts the width-matching class on the positioner and drops the card's size cap", async () => {
    const { dispose } = mount(() => <PopoverDemo defaultOpen matchAnchorWidth />);

    await waitForPositioned();
    // The *absence* of `max-w-*` is the load-bearing half: a card capped at its `size` would stay
    // narrower than a wide anchor. The recipe drops the cap when `matchAnchorWidth` is on rather than
    // emitting it and overriding it afterwards.
    expect(partOf("positioner")?.className).toContain("w-(--anchor-width)");
    expect(partOf("positioner")?.className).not.toContain("w-max");
    expect(partOf("content")?.className).not.toMatch(/\bmax-w-/);

    dispose();
  });
});

// Asserted **on the element**, never on the props type. Every shipped bug of this kind in this repo
// type-checked, passed its own suite, and shipped docs promising the opposite — a prop that is
// declared but silently dropped before it reaches the DOM breaks nothing a compiler can see.
describe("Popover — every part forwards its DOM props to the element", () => {
  it("forwards id/style/data-*/aria-*/ref and composes handlers on every part", async () => {
    const seen: string[] = [];
    const refs: Record<string, HTMLElement | undefined> = {};

    const { dispose } = mount(() => (
      <Themed>
        <Popover.Root defaultOpen>
          <Popover.Anchor
            id="probe-anchor"
            data-probe="anchor"
            style={ANCHOR_STYLE}
            ref={(element: HTMLDivElement) => {
              refs.anchor = element;
            }}
          />
          <Popover.Trigger
            id="probe-trigger"
            data-probe="trigger"
            style={TRIGGER_STYLE}
            lang="fr"
            onClick={() => seen.push("trigger")}
            ref={(element: HTMLButtonElement) => {
              refs.trigger = element;
            }}
          >
            Open popover
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner
              id="probe-positioner"
              data-probe="positioner"
              dir="ltr"
              style={POSITIONER_STYLE}
              ref={(element: HTMLDivElement) => {
                refs.positioner = element;
              }}
            >
              <Popover.Content
                id="probe-content"
                data-probe="content"
                aria-keyshortcuts="Escape"
                ref={(element: HTMLDivElement) => {
                  refs.content = element;
                }}
              >
                <Popover.Arrow
                  id="probe-arrow"
                  data-probe="arrow"
                  style={ARROW_STYLE}
                  ref={(element: HTMLDivElement) => {
                    refs.arrow = element;
                  }}
                />
                <Popover.Header
                  id="probe-header"
                  data-probe="header"
                  ref={(element: HTMLDivElement) => {
                    refs.header = element;
                  }}
                >
                  <Popover.Title id="probe-title" data-probe="title">
                    Popover title
                  </Popover.Title>
                  <Popover.Description id="probe-description" data-probe="description">
                    Popover description
                  </Popover.Description>
                </Popover.Header>
                <Popover.CloseTrigger
                  id="probe-close-trigger"
                  data-probe="close-trigger"
                  onClick={(event: MouseEvent) => {
                    seen.push("close-trigger");
                    event.preventDefault();
                  }}
                />
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </Themed>
    ));

    await waitForPositioned();

    for (const part of [
      "anchor",
      "trigger",
      "positioner",
      "content",
      "arrow",
      "header",
      "title",
      "description",
      "close-trigger",
    ]) {
      const element = document.querySelector<HTMLElement>(`[data-probe="${part}"]`);
      expect(element, `no element carries data-probe="${part}"`).not.toBeNull();
      expect(element?.id, `${part} dropped its id`).toBe(`probe-${part}`);
    }

    expect(refs.anchor?.id).toBe("probe-anchor");
    expect(refs.trigger?.id).toBe("probe-trigger");
    expect(refs.positioner?.id).toBe("probe-positioner");
    expect(refs.content?.id).toBe("probe-content");
    expect(refs.arrow?.id).toBe("probe-arrow");
    expect(refs.header?.id).toBe("probe-header");

    expect(refs.trigger?.getAttribute("lang")).toBe("fr");
    expect(refs.positioner?.getAttribute("dir")).toBe("ltr");
    // The consumer's own style object survives the kernel's positioning style (kernel first,
    // consumer last), and the content's `aria-keyshortcuts` is untouched by the hook's ARIA.
    expect(refs.trigger?.style.position).toBe("fixed");
    expect(refs.content?.getAttribute("aria-keyshortcuts")).toBe("Escape");
    // A consumer `id` on the content is what the trigger's `aria-controls` must name.
    expect(refs.trigger?.getAttribute("aria-controls")).toBe("probe-content");

    // Handlers compose consumer-first, and a `preventDefault()` cancels the part's own behavior.
    await userEvent.click(page.getByRole("button", { name: "Close" }));
    expect(seen).toContain("close-trigger");
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    await expectNoA11yViolations(document.body, AXE_OPTIONS);
    dispose();
  });
});

// A `render` target (this library's polymorphism prop — the consumer supplies the element) can fail
// two ways, both silent: the computed props stop reaching the element, taking the ARIA and the
// keyboard handling with them, or the internal ref is dropped, disabling whatever it powers with no
// error at all. So each case below asserts *behavior*, never just the tag.
const renderTriggerAsButton: NonNullable<Parameters<typeof Popover.Trigger>[0]["render"]> = (p) => (
  <button {...p} data-testid="custom-trigger" />
);
const renderPositionerAsDiv: NonNullable<Parameters<typeof Popover.Positioner>[0]["render"]> = (
  p,
) => <div {...p} data-testid="custom-positioner" />;
const renderContentAsDiv: NonNullable<Parameters<typeof Popover.Content>[0]["render"]> = (p) => (
  <div {...p} data-testid="custom-content" />
);
const renderArrowAsSpan: NonNullable<Parameters<typeof Popover.Arrow>[0]["render"]> = (p) => (
  <span {...(p as unknown as JSX.HTMLAttributes<HTMLSpanElement>)} data-testid="custom-arrow" />
);
const renderHeaderAsHgroup: NonNullable<Parameters<typeof Popover.Header>[0]["render"]> = (p) => (
  <hgroup {...(p as unknown as JSX.HTMLAttributes<HTMLElement>)} data-testid="custom-header" />
);
const renderTitleAsH3: NonNullable<Parameters<typeof Popover.Title>[0]["render"]> = (p) => (
  <h3 {...p} data-testid="custom-title" />
);
const renderDescriptionAsSpan: NonNullable<Parameters<typeof Popover.Description>[0]["render"]> = (
  p,
) => (
  <span
    {...(p as unknown as JSX.HTMLAttributes<HTMLSpanElement>)}
    data-testid="custom-description"
  />
);
const renderAnchorAsSection: NonNullable<Parameters<typeof Popover.Anchor>[0]["render"]> = (p) => (
  <section {...(p as unknown as JSX.HTMLAttributes<HTMLElement>)} data-testid="custom-anchor" />
);

describe("Popover — render re-targets every part without dropping props or refs", () => {
  it("keeps the computed props and the internal refs across a render swap", async () => {
    const { dispose } = mount(() => (
      <Themed>
        <Popover.Root defaultOpen>
          <Popover.Anchor render={renderAnchorAsSection} style={ANCHOR_STYLE}>
            anchor
          </Popover.Anchor>
          <Popover.Trigger render={renderTriggerAsButton} style={TRIGGER_STYLE}>
            Open popover
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Positioner render={renderPositionerAsDiv} style={POSITIONER_STYLE}>
              <Popover.Content render={renderContentAsDiv}>
                <Popover.Arrow render={renderArrowAsSpan} style={ARROW_STYLE} />
                <Popover.Header render={renderHeaderAsHgroup}>
                  <Popover.Title render={renderTitleAsH3}>Popover title</Popover.Title>
                  <Popover.Description render={renderDescriptionAsSpan}>
                    Popover description
                  </Popover.Description>
                </Popover.Header>
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </Themed>
    ));

    // The Positioner's ref is what floating-ui measures and moves: a target that drops it leaves the
    // layer parked at 0,0 forever. Waiting for a real `translate()` proves it survived.
    const positioner = await waitForPositioned();
    expect(positioner.dataset.testid).toBe("custom-positioner");

    // The Arrow's ref is what enables floating-ui's `arrow` middleware — no ref, no measurement.
    await vi.waitFor(() => {
      expect(page.getByTestId("custom-arrow").query()?.getAttribute("style")).toContain("left");
    });

    // Computed props survive: role, the labelling wired from the re-targeted Title/Description, and
    // the trigger's ARIA.
    const content = page.getByTestId("custom-content").query() as HTMLElement;
    expect(content.getAttribute("role")).toBe("dialog");
    expect(content.getAttribute("aria-labelledby")).toBe(
      (page.getByTestId("custom-title").query() as HTMLElement).id,
    );
    expect(content.getAttribute("aria-describedby")).toBe(
      (page.getByTestId("custom-description").query() as HTMLElement).id,
    );
    // Header carries no behavior of its own, so what a swap must not break is the labelling *through*
    // it: both ids above belong to elements nested inside the re-targeted wrapper.
    const header = page.getByTestId("custom-header").query() as HTMLElement;
    expect(header.contains(page.getByTestId("custom-title").query() as HTMLElement)).toBe(true);
    expect(header.contains(page.getByTestId("custom-description").query() as HTMLElement)).toBe(
      true,
    );
    await expect
      .element(page.getByTestId("custom-trigger"))
      .toHaveAttribute("aria-expanded", "true");

    // The Anchor's ref: the layer follows the re-targeted anchor, not the trigger.
    const anchorRect = (
      page.getByTestId("custom-anchor").query() as HTMLElement
    ).getBoundingClientRect();
    expect(Math.abs(positioner.getBoundingClientRect().top - anchorRect.bottom)).toBeLessThan(24);

    // The Content's ref powers the dismiss + focus effects: Escape still closes.
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(page.getByTestId("custom-content").query()).toBeNull());

    // The Trigger's ref registers it as the default anchor and as the one element outside-click
    // dismissal ignores — so a re-targeted trigger still toggles instead of dismissing-then-reopening.
    await userEvent.click(page.getByTestId("custom-trigger"));
    await expect.element(page.getByTestId("custom-content")).toBeInTheDocument();
    await userEvent.click(page.getByTestId("custom-trigger"));
    await vi.waitFor(() => expect(page.getByTestId("custom-content").query()).toBeNull());

    dispose();
  });
});

/** One animation frame's worth of the positioner's painted state. */
interface PresenceFrame {
  /** `data-presence`, or `null` once the positioner has left the document. */
  presence: string | null;
  /** `"unmounted"` stands in for the frames where there is no element to read. */
  visibility: string;
  transform: string;
}

function readPositionerFrame(): PresenceFrame {
  const positioner = partOf("positioner");
  if (positioner === null) {
    return { presence: null, visibility: "unmounted", transform: "none" };
  }
  const computed = window.getComputedStyle(positioner);
  return {
    presence: positioner.getAttribute("data-presence"),
    visibility: computed.visibility,
    transform: computed.transform,
  };
}

/** Enough to outlast both the double-rAF `entering → entered` flip and a 150ms exit. */
const SAMPLED_FRAMES = 15;

/**
 * Runs `act()` and records the positioner's **computed** style once per animation frame from there.
 *
 * `act` must be a synchronous `.click()`, registered in the same task as the loop: `userEvent.click()`
 * costs a round-trip to the browser, so the frames this exists to inspect — between the state change
 * and the layer settling — would already be behind us by the time it resolved. Reading the *computed*
 * style rather than `element.style` is deliberate too: it is where a recipe class would show up if
 * the `positioner` slot ever grew a positional one.
 */
function sampleFrames(act: () => void, frameCount = SAMPLED_FRAMES): Promise<PresenceFrame[]> {
  const samples: PresenceFrame[] = [];
  return new Promise<PresenceFrame[]>((resolve) => {
    const tick = () => {
      samples.push(readPositionerFrame());
      if (samples.length >= frameCount) {
        resolve(samples);
        return;
      }
      requestAnimationFrame(tick);
    };
    act();
    requestAnimationFrame(tick);
  });
}

/**
 * Two independent clocks run over the same element, and these tests sample the actual frames rather
 * than reason about the interleaving:
 *
 * - **Positioning** parks an unmeasured layer at `{ left: 0, top: 0, visibility: "hidden" }` and
 *   lifts that hiding in the *same* read that writes the real `translate()`.
 * - **The enter/exit animation state** walks `entering → entered → exiting → exited` on its own
 *   `requestAnimationFrame` schedule.
 *
 * A third case — hydrate closed, then open, and it still positions — lives in "leaves the hydrated
 * trigger interactive, and mounts the portal client-side" below, and is not repeated here.
 */
describe("Popover — R9: presence over the kernel's pre-positioned visibility", () => {
  it("never paints an unmeasured layer, and is positioned before presence reports `entered`", async () => {
    const { dispose } = mount(() => <PopoverDemo contentStyle={TRANSITIONED_CONTENT_STYLE} />);
    const trigger = triggerLocator().query() as HTMLElement;

    const frames = await sampleFrames(() => trigger.click());

    // `visibility` and the `translate()` are lifted together, so a frame that is visible with no
    // transform means the layer was painted at 0,0 — over the document's top-left corner, for as long
    // as the measurement took.
    const paintedUnmeasured = frames.find(
      (frame) => frame.visibility === "visible" && frame.transform === "none",
    );
    expect(
      paintedUnmeasured,
      `painted before measuring: ${JSON.stringify(frames)}`,
    ).toBeUndefined();

    // Which clock wins, measured rather than argued: floating-ui's `computePosition` resolves on the
    // microtask queue *inside* the task that mounted the layer, while `entering → entered` costs two
    // animation frames. So the layer is positioned by the first sampled frame, and there is still an
    // `entering` frame that is genuinely visible for a CSS transition to animate from.
    const enteringVisible = frames.filter(
      (frame) => frame.presence === "entering" && frame.visibility === "visible",
    );
    expect(enteringVisible.length, JSON.stringify(frames)).toBeGreaterThan(0);

    // The `positioner` slot carries nothing positional, so the only `transform` on this element is
    // the one floating-ui wrote — a real translation, not the identity matrix a layer stuck at 0,0
    // would compute to.
    const settled = frames[frames.length - 1];
    expect(settled?.presence).toBe("entered");
    expect(settled?.transform).toMatch(/^matrix\(/);
    expect(settled?.transform).not.toBe("matrix(1, 0, 0, 1, 0, 0)");

    dispose();
  });

  it("keeps a closing layer positioned for every frame of its exit", async () => {
    const { dispose } = mount(() => <PopoverDemo contentStyle={TRANSITIONED_CONTENT_STYLE} />);
    const trigger = triggerLocator().query() as HTMLElement;

    trigger.click();
    await waitForPositioned();

    const frames = await sampleFrames(() => trigger.click());
    const exiting = frames.filter((frame) => frame.presence === "exiting");

    // Not a smoke check: the loop below quantifies over this set, and an empty set passes it while
    // proving nothing. It is empty whenever the card has no authored exit duration — the default in
    // this project. See `TRANSITIONED_CONTENT_STYLE`.
    expect(
      exiting.length,
      `no exiting frame to inspect: ${JSON.stringify(frames)}`,
    ).toBeGreaterThan(0);

    // Positioning stays active for as long as the element is *mounted*, not for as long as the
    // popover is *open*. Keyed on `open`, it would drop back to the hidden 0,0 state the instant the
    // popover closed — while the exit animation still held the card mounted — so the card would
    // vanish rather than animate out. Every exiting frame staying visible *and* translated is what
    // says it didn't.
    for (const frame of exiting) {
      expect(frame.visibility, `exit frame went hidden: ${JSON.stringify(frames)}`).toBe("visible");
      expect(frame.transform, `exit frame lost its position: ${JSON.stringify(frames)}`).toMatch(
        /^matrix\(/,
      );
    }

    dispose();
  });
});

// `Tree` is the same tree `popover.ssr.test.tsx` snapshots and the fixture bridge renders on the
// server, so the hydration input and the client tree cannot structurally diverge. That matters
// because Solid pairs server and client nodes by a key it derives from each node's *path through the
// component tree*: inserting any component before `Popover.Trigger`, even one that renders nothing,
// shifts the trigger's key and breaks the match. `hydrateFixture` fails if hydration warned or
// re-created a node instead of adopting the server's.
describe("Popover — hydration", () => {
  it("hydrates the server HTML in place, without a mismatch or a second render", () => {
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    dispose();
  });

  it("leaves the hydrated trigger interactive, and mounts the portal client-side", async () => {
    // The whole point of `Popover.Portal`'s `isServer` guard: portaled content is absent from the
    // SSR HTML, and appears on the client only once the popover opens.
    const { dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    expect(page.getByRole("dialog").query()).toBeNull();

    await userEvent.click(page.getByRole("button", { name: "Open popover" }));
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();
    // Hydrated closed, then opened — and it still positions. Nothing in the tree branches on the
    // resolved `side`/`align`; only CSS keyed on `data-side` reacts to them. So the client's first
    // measurement cannot introduce a structural difference from the server render.
    await waitForPositioned();

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
