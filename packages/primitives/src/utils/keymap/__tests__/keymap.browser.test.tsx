import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import type { JSX } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { composeEventHandlers } from "../../events/events";
import { createKeyboardHandler } from "../keymap";

/** A focusable target that spreads the keymap's `onKeyDown`. */
function Target(props: {
  onKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent>;
  consumerOnKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>;
}) {
  return (
    <input
      data-testid="target"
      aria-label="keymap target"
      onKeyDown={
        props.consumerOnKeyDown
          ? composeEventHandlers(props.consumerOnKeyDown, props.onKeyDown)
          : props.onKeyDown
      }
    />
  );
}

async function focusTarget() {
  await userEvent.click(page.getByTestId("target"));
}

describe("createKeyboardHandler", () => {
  it("dispatches a plain key binding", async () => {
    const down = vi.fn();
    const keys = createKeyboardHandler<HTMLInputElement>().on("ArrowDown", down);
    const { dispose } = mount(() => <Target onKeyDown={keys.onKeyDown} />);

    await focusTarget();
    await userEvent.keyboard("{ArrowDown}");
    expect(down).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("matches modifiers exactly, keeping bare and modified combos distinct", async () => {
    const plain = vi.fn();
    const shifted = vi.fn();
    const keys = createKeyboardHandler<HTMLInputElement>()
      .on("Home", plain)
      .on("shift+Home", shifted);
    const { dispose } = mount(() => <Target onKeyDown={keys.onKeyDown} />);

    await focusTarget();
    await userEvent.keyboard("{Home}");
    expect(plain).toHaveBeenCalledTimes(1);
    expect(shifted).not.toHaveBeenCalled();

    await userEvent.keyboard("{Shift>}{Home}{/Shift}");
    expect(shifted).toHaveBeenCalledTimes(1);
    expect(plain).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("binds several keys to one handler via an array", async () => {
    const activate = vi.fn();
    const keys = createKeyboardHandler<HTMLInputElement>().on(["Enter", " "], activate);
    const { dispose } = mount(() => <Target onKeyDown={keys.onKeyDown} />);

    await focusTarget();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(activate).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("matches single letters case-insensitively", async () => {
    const handler = vi.fn();
    const keys = createKeyboardHandler<HTMLInputElement>().on("a", handler);
    const { dispose } = mount(() => <Target onKeyDown={keys.onKeyDown} />);

    await focusTarget();
    await userEvent.keyboard("A"); // Shift + a
    expect(handler).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("routes printable characters to onText only when no binding matched", async () => {
    const arrow = vi.fn();
    const text = vi.fn();
    const keys = createKeyboardHandler<HTMLInputElement>().on("ArrowDown", arrow).onText(text);
    const { dispose } = mount(() => <Target onKeyDown={keys.onKeyDown} />);

    await focusTarget();
    await userEvent.keyboard("b");
    expect(text).toHaveBeenCalledTimes(1);
    expect(text).toHaveBeenLastCalledWith("b", expect.anything());

    await userEvent.keyboard("{ArrowDown}");
    expect(arrow).toHaveBeenCalledTimes(1);
    // A matched binding does not fall through to onText.
    expect(text).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("does not treat Ctrl/Meta chords as typeahead text", async () => {
    const text = vi.fn();
    const keys = createKeyboardHandler<HTMLInputElement>().onText(text);
    const { dispose } = mount(() => <Target onKeyDown={keys.onKeyDown} />);

    await focusTarget();
    await userEvent.keyboard("{Control>}a{/Control}");
    expect(text).not.toHaveBeenCalled();
    dispose();
  });

  it("composes behind a consumer handler whose preventDefault cancels the map", async () => {
    const arrow = vi.fn();
    const keys = createKeyboardHandler<HTMLInputElement>().on("ArrowDown", arrow);
    const { dispose } = mount(() => (
      <Target onKeyDown={keys.onKeyDown} consumerOnKeyDown={(event) => event.preventDefault()} />
    ));

    await focusTarget();
    await userEvent.keyboard("{ArrowDown}");
    expect(arrow).not.toHaveBeenCalled();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const keys = createKeyboardHandler<HTMLInputElement>().on("ArrowDown", () => {});
    const { container, dispose } = mount(() => <Target onKeyDown={keys.onKeyDown} />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
