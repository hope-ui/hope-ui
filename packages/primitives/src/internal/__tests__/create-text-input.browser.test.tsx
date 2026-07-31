import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  type CreateTextInputOptions,
  type CreateTextInputReturn,
  createTextInput,
} from "../create-text-input";

/**
 * The primitive is created *inside* the mounted component and published to a local, so no test
 * reads a prop from a render body — which would be an untracked read of a reactive source, and
 * `mount()` fails on those.
 */
function renderInput(
  options: CreateTextInputOptions & {
    type?: string;
    /** Passed straight to the element — the primitive never consumes it. */
    onBeforeInput?: JSX.InputEventHandlerUnion<HTMLInputElement, InputEvent>;
  } = {},
) {
  let api!: CreateTextInputReturn;
  const { container, dispose } = mount(() => {
    api = createTextInput(options);
    return (
      <input
        aria-label="Text"
        type={options.type}
        onBeforeInput={options.onBeforeInput}
        ref={api.setRef}
        {...api.inputProps}
      />
    );
  });
  const input = container.querySelector("input") as HTMLInputElement;
  return { api, input, container, dispose };
}

/** What an IME does between `compositionstart` and `compositionend`: write the candidate text. */
function composeInto(input: HTMLInputElement, candidate: string) {
  input.value = candidate;
  input.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
}

describe("createTextInput", () => {
  describe("value", () => {
    it("reports what the user typed, uncontrolled", async () => {
      const { api, input, dispose } = renderInput({ defaultValue: () => "" });

      input.focus();
      await userEvent.keyboard("abc");

      await vi.waitFor(() => expect(api.value()).toBe("abc"));
      expect(input.value).toBe("abc");

      dispose();
    });

    it("renders the controlled value into the markup without a live binding", () => {
      const { input, dispose } = renderInput({ value: () => "Apple" });

      expect(input.value).toBe("Apple");

      dispose();
    });

    it("writes a controlled change the consumer accepted", async () => {
      const [value, setValue] = createSignal("Apple");
      const { input, dispose } = renderInput({ value, onChange: setValue });

      setValue("Banana");

      await vi.waitFor(() => expect(input.value).toBe("Banana"));

      dispose();
    });

    it("snaps the DOM back when the controlled consumer rejects the change", async () => {
      // The reason a reconcile is requested per input event rather than only on value change:
      // nothing reactive moves here, so a value-change-only effect would never run and the
      // element would keep text the component does not report.
      const onChange = vi.fn();
      const { api, input, dispose } = renderInput({ value: () => "fixed", onChange });

      input.focus();
      input.setSelectionRange(5, 5);
      await userEvent.keyboard("x");

      expect(onChange).toHaveBeenCalledWith("fixedx");
      await vi.waitFor(() => expect(input.value).toBe("fixed"));
      expect(api.value()).toBe("fixed");

      dispose();
    });
  });

  describe("selection preservation", () => {
    it("keeps the caret in place when a controlled consumer transforms the value", async () => {
      // Without the capture-and-reapply, `input.value = "AXBC"` drops the caret at the end and
      // every keystroke mid-word teleports it — the bug that makes autocomplete feel broken.
      const [value, setValue] = createSignal("abc");
      const { input, dispose } = renderInput({
        value,
        onChange: (next) => setValue(next.toUpperCase()),
      });

      input.focus();
      input.setSelectionRange(1, 1);
      await userEvent.keyboard("X");

      await vi.waitFor(() => expect(input.value).toBe("AXBC"));
      expect(input.selectionStart).toBe(2);
      expect(input.selectionEnd).toBe(2);

      dispose();
    });

    it("places the caret where `setValue` asks — the inline-autocomplete shape", async () => {
      const [value, setValue] = createSignal("ca");
      const { api, input, dispose } = renderInput({ value, onChange: setValue });

      input.focus();
      input.setSelectionRange(2, 2);
      api.setValue("café", { start: 2, end: 4 });

      await vi.waitFor(() => expect(input.value).toBe("café"));
      expect(input.selectionStart).toBe(2);
      expect(input.selectionEnd).toBe(4);

      dispose();
    });

    it("leaves the caret at the end for a `setValue` with no selection", async () => {
      const [value, setValue] = createSignal("app");
      const { api, input, dispose } = renderInput({ value, onChange: setValue });

      input.focus();
      input.setSelectionRange(1, 1);
      api.setValue("Apple");

      await vi.waitFor(() => expect(input.value).toBe("Apple"));
      expect(input.selectionStart).toBe(5);

      dispose();
    });

    it("survives a captured caret that is past the end of a shorter new value", async () => {
      // Pinning the browser behavior the primitive leans on instead of re-implementing:
      // `setSelectionRange` clamps both offsets to the value's length.
      const [value, setValue] = createSignal("abcdef");
      const { input, dispose } = renderInput({
        value,
        onChange: (next) => setValue(next.slice(0, 2)),
      });

      input.focus();
      input.setSelectionRange(6, 6);
      await userEvent.keyboard("g");

      await vi.waitFor(() => expect(input.value).toBe("ab"));
      expect(input.selectionStart).toBe(2);

      dispose();
    });

    it("does not throw on an input type with no text-entry cursor", async () => {
      const [value, setValue] = createSignal("");
      const { input, dispose } = renderInput({
        type: "email",
        value,
        onChange: (next) => setValue(next.toUpperCase()),
      });

      // `selectionStart` reads `null` on these, and `setSelectionRange` throws `InvalidStateError`.
      expect(input.selectionStart).toBeNull();

      input.focus();
      await userEvent.keyboard("ab");

      await vi.waitFor(() => expect(input.value).toBe("AB"));

      dispose();
    });
  });

  describe("IME composition", () => {
    it("leaves the candidate text alone while composing, then commits it", async () => {
      const [value, setValue] = createSignal("");
      const { api, input, dispose } = renderInput({
        value,
        onChange: (next) => setValue(next.toUpperCase()),
      });

      input.focus();
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      composeInto(input, "ka");

      await vi.waitFor(() => expect(value()).toBe("KA"));
      expect(api.isComposing()).toBe(true);
      // The whole point: writing "KA" here replaces the IME's candidate buffer and the
      // half-typed word is gone.
      expect(input.value).toBe("ka");

      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "ka" }));

      await vi.waitFor(() => expect(input.value).toBe("KA"));
      expect(api.isComposing()).toBe(false);

      dispose();
    });

    it("reports every composition update through `onChange`", async () => {
      const onChange = vi.fn();
      const { input, dispose } = renderInput({ defaultValue: () => "", onChange });

      input.focus();
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      composeInto(input, "n");
      composeInto(input, "ni");

      await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith("ni"));
      expect(onChange.mock.calls.map(([next]) => next)).toEqual(["n", "ni"]);

      dispose();
    });

    it("commits from `compositionend` alone, whichever side of it the final input lands", async () => {
      // Chrome fires the final `input` before `compositionend`; Safari after. Re-reading the DOM
      // in the handler is what makes both orderings commit the same text.
      const onChange = vi.fn();
      const { api, input, dispose } = renderInput({ defaultValue: () => "", onChange });

      input.focus();
      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      input.value = "に";
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "に" }));

      await vi.waitFor(() => expect(api.value()).toBe("に"));
      expect(onChange).toHaveBeenCalledWith("に");

      dispose();
    });
  });

  describe("consumer handlers", () => {
    it("runs the consumer's `onInput` before the value is recorded", async () => {
      const order: string[] = [];
      const { input, dispose } = renderInput({
        defaultValue: () => "",
        onChange: () => order.push("behavior"),
        onInput: () => () => order.push("consumer"),
      });

      input.focus();
      await userEvent.keyboard("a");

      await vi.waitFor(() => expect(order).toEqual(["consumer", "behavior"]));

      dispose();
    });

    it("does not treat `preventDefault()` on `input` as a cancel — `beforeinput` is the veto", async () => {
      // The repo-wide cancel channel needs a cancelable event, and `input` is not one:
      // `defaultPrevented` stays `false`, so the behavior below runs regardless. The element's
      // own `beforeinput` is cancelable, and the primitive never consumes it.
      const onChange = vi.fn();
      const { api, input, dispose } = renderInput({
        defaultValue: () => "",
        onChange,
        onInput: () => (event) => event.preventDefault(),
      });

      input.focus();
      await userEvent.keyboard("a");

      await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith("a"));

      dispose();

      const vetoed = renderInput({
        defaultValue: () => "",
        onChange: vi.fn(),
        onBeforeInput: (event) => event.preventDefault(),
      });

      vetoed.input.focus();
      await userEvent.keyboard("a");

      expect(vetoed.input.value).toBe("");
      expect(vetoed.api.value()).toBe("");

      vetoed.dispose();
      expect(api.value()).toBe("a");
    });

    it("composes the consumer's composition handlers", async () => {
      const onCompositionStart = vi.fn();
      const onCompositionEnd = vi.fn();
      const { input, dispose } = renderInput({
        defaultValue: () => "",
        onCompositionStart: () => onCompositionStart,
        onCompositionEnd: () => onCompositionEnd,
      });

      input.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      input.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "" }));

      await vi.waitFor(() => expect(onCompositionEnd).toHaveBeenCalled());
      expect(onCompositionStart).toHaveBeenCalled();

      dispose();
    });
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = renderInput({ defaultValue: () => "Apple" });

    await expectNoA11yViolations(container);

    dispose();
  });
});
