import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal, flush, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { createHiddenSelect } from "../create-hidden-select";

interface HarnessProps {
  defaultValue?: string[];
  onReset?: (values: string[]) => void;
  focusTrigger?: () => void;
  required?: boolean;
  /** Renders an empty required field *before* the tracked one, so it is the form's first invalid. */
  leadingRequiredField?: boolean;
  /** Whether the tracked control is currently rendered. The form outlives it either way. */
  present?: boolean;
}

/**
 * The hook against a plain `<input>` rather than a `HiddenSelect` — everything it does is about the
 * control's *form*, so the control's own kind is irrelevant, and a visible one keeps the tree
 * trivially accessible.
 */
function Harness(props: HarnessProps): JSX.Element {
  const [element, setElement] = createSignal<HTMLInputElement | null>();
  createHiddenSelect<string[]>({
    element,
    defaultValue: () => props.defaultValue ?? [],
    onReset: (values) => props.onReset?.(values),
    focusTrigger: () => props.focusTrigger?.(),
  });

  return (
    <form>
      <Show when={props.leadingRequiredField}>
        <input type="text" name="before" aria-label="Before" required />
      </Show>
      <Show when={props.present ?? true}>
        <input
          type="text"
          name="field"
          aria-label="Field"
          ref={setElement}
          required={props.required}
        />
      </Show>
      <button type="submit">Submit</button>
    </form>
  );
}

const form = (container: HTMLElement) => container.querySelector("form") as HTMLFormElement;
const field = (container: HTMLElement) =>
  container.querySelector('input[name="field"]') as HTMLInputElement;
const submit = (container: HTMLElement) =>
  container.querySelector('button[type="submit"]') as HTMLButtonElement;

describe("createHiddenSelect — form reset", () => {
  it("hands `defaultValue()` back when the owning form resets", async () => {
    const onReset = vi.fn();
    const { container, dispose } = mount(() => (
      <Harness defaultValue={["a", "b"]} onReset={onReset} />
    ));

    form(container).reset();

    expect(onReset).toHaveBeenCalledExactlyOnceWith(["a", "b"]);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("reads `defaultValue()` at reset time, not at creation time", async () => {
    // The value is a *sample*, not a dependency — tracking it would tear the listeners down and
    // reattach them on every selection change.
    const [defaultValue, setDefaultValue] = createSignal(["a"]);
    const onReset = vi.fn();
    const { container, dispose } = mount(() => (
      <Harness defaultValue={defaultValue()} onReset={onReset} />
    ));

    flush(() => setDefaultValue(["z"]));
    form(container).reset();

    expect(onReset).toHaveBeenCalledExactlyOnceWith(["z"]);
    await expectNoA11yViolations(container);
    dispose();
  });

  it("ignores a reset another listener already cancelled", async () => {
    const onReset = vi.fn();
    const { container, dispose } = mount(() => <Harness onReset={onReset} />);

    // Registered on an ancestor in the capture phase, so it genuinely runs *before* the hook's own
    // listener — same-target listeners fire in registration order, and the hook's came first.
    container.addEventListener("reset", (event) => event.preventDefault(), { capture: true });
    form(container).reset();

    expect(onReset).not.toHaveBeenCalled();
    await expectNoA11yViolations(container);
    dispose();
  });

  it("waits for a lazily rendered control before attaching", async () => {
    // Why `element` must be a real signal accessor: a hidden field is rendered as a consequence of
    // `name` (and of the option count), so an untracked read would catch it `undefined`, forever.
    const onReset = vi.fn();
    const [present, setPresent] = createSignal(false);
    const { container, dispose } = mount(() => <Harness present={present()} onReset={onReset} />);

    form(container).reset();
    expect(onReset).not.toHaveBeenCalled();

    flush(() => setPresent(true));
    await vi.waitFor(() => expect(field(container)).not.toBeNull());

    form(container).reset();
    expect(onReset).toHaveBeenCalledOnce();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("detaches its listeners when the owner is disposed", async () => {
    const onReset = vi.fn();
    const { container, dispose } = mount(() => <Harness onReset={onReset} />);
    const owningForm = form(container);

    await expectNoA11yViolations(container);
    dispose();

    owningForm.reset();
    expect(onReset).not.toHaveBeenCalled();
  });
});

describe("createHiddenSelect — invalid", () => {
  it("cancels the browser's error UI and focuses the trigger", async () => {
    const focusTrigger = vi.fn();
    const { container, dispose } = mount(() => <Harness required focusTrigger={focusTrigger} />);

    const event = new Event("invalid", { cancelable: true, bubbles: false });
    field(container).dispatchEvent(event);

    // Cancelling `invalid` suppresses the *report*, never the constraint — see the hook's doc.
    expect(event.defaultPrevented).toBe(true);
    expect(focusTrigger).toHaveBeenCalledOnce();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("takes focus on a blocked submit", async () => {
    const focusTrigger = vi.fn();
    const { container, dispose } = mount(() => <Harness required focusTrigger={focusTrigger} />);

    await userEvent.click(submit(container));

    await vi.waitFor(() => expect(focusTrigger).toHaveBeenCalledOnce());
    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves focus alone when an earlier control is the form's first invalid one", async () => {
    const focusTrigger = vi.fn();
    const { container, dispose } = mount(() => (
      <Harness required leadingRequiredField focusTrigger={focusTrigger} />
    ));

    const event = new Event("invalid", { cancelable: true, bubbles: false });
    field(container).dispatchEvent(event);

    // Still cancelled — the bubble would point at a control the user cannot see either way.
    expect(event.defaultPrevented).toBe(true);
    expect(focusTrigger).not.toHaveBeenCalled();

    await expectNoA11yViolations(container);
    dispose();
  });

  it("leaves an already-cancelled invalid event's focus to whoever cancelled it", async () => {
    const focusTrigger = vi.fn();
    const { container, dispose } = mount(() => <Harness required focusTrigger={focusTrigger} />);

    field(container).addEventListener("invalid", (event) => event.preventDefault(), {
      capture: true,
    });
    field(container).dispatchEvent(new Event("invalid", { cancelable: true }));

    expect(focusTrigger).not.toHaveBeenCalled();
    await expectNoA11yViolations(container);
    dispose();
  });
});
