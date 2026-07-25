import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { type Accessor, createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createTextDirectionWarning, type TextDirection } from "../create-text-direction-warning";

/**
 * A consumer in miniature: an element the browser lays out, and a keymap direction that comes from
 * somewhere else entirely (a locale, in the real hooks). The whole point of the primitive is that
 * nothing joins those two, so the probe keeps them deliberately independent.
 */
function Probe(props: {
  direction: TextDirection;
  active?: Accessor<boolean>;
  name?: string;
}): JSX.Element {
  // `props.direction` is read through the accessor below, so a parent signal driving it re-runs the
  // effect — the runtime-flip case at the bottom of the file.
  const [element, setElement] = createSignal<HTMLElement | null>();

  createTextDirectionWarning({
    name: props.name ?? "Probe",
    direction: () => props.direction,
    element,
    active: props.active,
  });

  return (
    <p ref={setElement} data-testid="probe">
      probe
    </p>
  );
}

/** The warning lands in an effect, so every assertion waits for the flush. */
async function warningsAfterMount(tree: () => JSX.Element) {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { container, dispose } = mount(tree);

  await vi.waitFor(() => expect(container.querySelector('[data-testid="probe"]')).not.toBeNull());
  // One extra macrotask so a warning that is coming has certainly arrived — otherwise the negative
  // assertions would pass simply by being early.
  await new Promise((resolve) => setTimeout(resolve, 0));

  const messages = warn.mock.calls.flat().join(" ");
  warn.mockRestore();
  return { messages, container, dispose };
}

describe("createTextDirectionWarning", () => {
  it("warns when the keymap's direction disagrees with the applied layout", async () => {
    // The real shape: an `I18nProvider locale="ar-EG"` on a page whose `dir` was never set.
    const { messages, container, dispose } = await warningsAfterMount(() => (
      <Probe name="Listbox" direction="rtl" />
    ));

    expect(messages).toContain("[hope-ui] Listbox");
    expect(messages).toContain('mirror "rtl"');
    expect(messages).toContain('lays it out "ltr"');
    // Names the fix, not just the fault.
    expect(messages).toContain("document.documentElement.dir");

    await expectNoA11yViolations(container);
    dispose();
  });

  it("stays quiet when the app declares the direction where the browser can see it", async () => {
    const { messages, dispose } = await warningsAfterMount(() => (
      <div dir="rtl">
        <Probe direction="rtl" />
      </div>
    ));

    expect(messages).not.toContain("[hope-ui]");
    dispose();
  });

  it("stays quiet when both are ltr", async () => {
    const { messages, dispose } = await warningsAfterMount(() => <Probe direction="ltr" />);

    expect(messages).not.toContain("[hope-ui]");
    dispose();
  });

  it("stays quiet while inactive, so a vertical listbox never warns", async () => {
    // Direction cannot change an Up/Down keymap, so the mismatch is unobservable — warning about it
    // would be noise in every app that simply hasn't set `dir` yet.
    const { messages, dispose } = await warningsAfterMount(() => (
      <Probe direction="rtl" active={() => false} />
    ));

    expect(messages).not.toContain("[hope-ui]");
    dispose();
  });

  it("re-checks when the keymap's direction changes at runtime", async () => {
    // The realistic runtime flip: the app switches locale, so `direction()` changes. The DOM does not
    // follow (that is the whole mistake), and the effect re-runs on the new direction and says so.
    //
    // The converse — an ANCESTOR's `dir` flipping while the locale stays put — is NOT observed, and
    // deliberately: computed style is not reactive, so catching it would need a `MutationObserver`
    // over the ancestor chain, which is more machinery than a dev warning is worth.
    const [direction, setDirection] = createSignal<TextDirection>("ltr");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { container, dispose } = mount(() => <Probe direction={direction()} />);
    await vi.waitFor(() => expect(container.querySelector('[data-testid="probe"]')).not.toBeNull());
    expect(warn.mock.calls.flat().join(" ")).not.toContain("[hope-ui]");

    setDirection("rtl");
    await vi.waitFor(() =>
      expect(warn).toHaveBeenCalledWith(expect.stringContaining("[hope-ui] Probe")),
    );

    warn.mockRestore();
    dispose();
  });
});
