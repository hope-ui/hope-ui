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

// Every tree here sits under a `<ThemeProvider>` fed the `hope` preset: `Popover.Root` reads a
// recipe, and `Popover.CloseTrigger` renders a recipe-styled `CloseButton`. It is a zero-DOM
// provider (its token values live in CSS), so it changes nothing the assertions look at — except
// `_hk` keys, which is why the hydration tree carries it identically.
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
 * **The browser project loads no compiled Tailwind**, so every recipe class here is an inert string:
 * an unstyled positioner is a block `<div>` as wide as the viewport, which makes `flip`'s cross-axis
 * check fire and silently rewrites `data-align` to `end`. These two give the layer and its arrow a
 * real box so the measured assertions mean what they say — and they ride the kernel-first/
 * consumer-last `style` merge, which is the documented way a consumer overrides a positioned layer.
 */
const POSITIONER_STYLE: JSX.CSSProperties = { width: "200px" };
const ARROW_STYLE: JSX.CSSProperties = { width: "8px", height: "8px" };

interface PopoverDemoProps {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnFocusOutside?: boolean;
  side?: PopoverRootProps["side"];
  align?: PopoverRootProps["align"];
  triggerStyle?: JSX.CSSProperties;
  /** Mount a `Popover.Anchor`, which outranks the trigger as the positioning reference. */
  withAnchor?: boolean;
  /** A focusable control inside the popup, before the CloseTrigger. */
  withInnerButton?: boolean;
  /** A focusable control after the popover, so Tab has somewhere to leave to. */
  withOutsideButton?: boolean;
}

// The canonical consumer tree — the same shape as the ssr-entry's, plus the knobs the behavior tests
// need. `Popover.Title` is not decoration: a `role="dialog"` surface with no accessible name is an
// axe `aria-dialog-name` violation.
const PopoverDemo: Component<PopoverDemoProps> = (props) => (
  <Themed>
    <Popover.Root
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
      closeOnFocusOutside={props.closeOnFocusOutside}
      side={props.side}
      align={props.align}
    >
      <Show when={props.withAnchor}>
        <Popover.Anchor data-testid="anchor" style={ANCHOR_STYLE}>
          anchor
        </Popover.Anchor>
      </Show>
      <Popover.Trigger style={props.triggerStyle ?? TRIGGER_STYLE}>Open popover</Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner style={POSITIONER_STYLE}>
          <Popover.Content>
            <Popover.Arrow style={ARROW_STYLE} />
            <Popover.Title>Popover title</Popover.Title>
            <Popover.Description>Popover description</Popover.Description>
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
 * The component-layer stand-in for `floating.isPositioned()`: `floatingStyles()` is the
 * `visibility: hidden` pre-positioned branch until the first measurement lands, after which the key
 * is absent from the style object entirely and a real `translate()` appears. Axe and every geometry
 * assertion must wait for it — before it, they would inspect the layer parked at 0,0.
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
 * Axe returns `aria-valid-attr-value` as *incomplete* for **any** element carrying both
 * `aria-haspopup` and `aria-controls`, without ever resolving the IDREF
 * (`ariaValidAttrValueEvaluate`'s `controlsWithinPopup` pre-check) — undecidable by construction,
 * not a markup problem. The IDREF itself is pinned below, and in `popover-trigger.browser.test.tsx`.
 */
const AXE_OPTIONS = { allowIncomplete: ["aria-valid-attr-value"] };

describe("Popover — open/close behavior", () => {
  it("opens on trigger click and closes on the second click", async () => {
    const { dispose } = mount(() => <PopoverDemo />);

    await userEvent.click(triggerLocator());
    await expect.element(page.getByRole("dialog")).toBeInTheDocument();

    // The whole point of the Phase 3 `exclude` work: without the trigger in `dismissExclusions`, the
    // capture-phase pointerdown dismisses and the trigger's own click reopens, so an open popover
    // could never be closed by the control that opened it.
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
      // The measured offset the middleware wrote — proof the arrow's ref reached the config memo.
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
});

// Every one of these asserts the attribute **on the element**, never on the props type: all three
// shipped bugs in this family (Calendar.Root, Listbox.ItemIndicator, five Alert parts) type-checked,
// passed their own suites, and shipped docs promising the opposite.
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
                <Popover.Title id="probe-title" data-probe="title">
                  Popover title
                </Popover.Title>
                <Popover.Description id="probe-description" data-probe="description">
                  Popover description
                </Popover.Description>
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

// A `render` target can fail two ways, both silent: the computed props stop reaching the element
// (the ARIA and the keymap ride on them), or the internal ref is dropped — which disables whatever
// that ref powers with no error at all. So each case asserts *behavior*, not the tag.
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
                <Popover.Title render={renderTitleAsH3}>Popover title</Popover.Title>
                <Popover.Description render={renderDescriptionAsSpan}>
                  Popover description
                </Popover.Description>
              </Popover.Content>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>
      </Themed>
    ));

    // The Positioner's ref is what `createFloating` measures and moves: a target that drops it
    // leaves the layer parked at 0,0 forever. Waiting for a real `translate()` proves it survived.
    const positioner = await waitForPositioned();
    expect(positioner.dataset.testid).toBe("custom-positioner");

    // The Arrow's ref is what enables the `arrow` middleware at all — no ref, no measurement, ever.
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

    // And the Trigger's ref is its registration as the dismiss exclusion + default anchor — so the
    // re-targeted trigger still toggles rather than dismissing-then-reopening.
    await userEvent.click(page.getByTestId("custom-trigger"));
    await expect.element(page.getByTestId("custom-content")).toBeInTheDocument();
    await userEvent.click(page.getByTestId("custom-trigger"));
    await vi.waitFor(() => expect(page.getByTestId("custom-content").query()).toBeNull());

    dispose();
  });
});

// `Tree` is the same tree `popover.ssr.test.tsx` inline-snapshots and the bridge renders server-side,
// so the hydration input and the client tree cannot structurally diverge — which matters because
// `_hk` keys are a path through the component tree: a component inserted before `Popover.Trigger`,
// even one rendering nothing, would shift the trigger's key. `hydrateFixture` proves hydration was
// silent and reused every server node.
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
    // Hydrated closed, then opened — and it still positions. The tree never branches on `side()`, so
    // there is no server/client structural difference for the measurement to land on.
    await waitForPositioned();

    dispose();
  });

  it("has no accessibility violations after hydrating", async () => {
    const { container, dispose } = hydrateFixture(ssrFixture, () => <Tree />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
