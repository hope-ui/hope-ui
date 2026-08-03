import { expectNoA11yViolations, mount } from "@hope-ui/internal-test-utils";
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";
import { createFocusScope } from "../create-focus-scope";
import { createFocusTrap } from "../create-focus-trap";

function TestHarness() {
  const [active, setActive] = createSignal(false);
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();

  createFocusTrap({ active, ref: containerRef });

  return (
    <div>
      <button type="button" data-testid="toggle" onClick={() => setActive((value) => !value)}>
        Toggle
      </button>
      <button type="button" data-testid="outside-after">
        After
      </button>
      <div data-testid="container" ref={setContainerRef}>
        <button type="button" data-testid="first">
          First
        </button>
        <button type="button" data-testid="second">
          Second
        </button>
        <button type="button" data-testid="last">
          Last
        </button>
      </div>
    </div>
  );
}

describe("createFocusTrap", () => {
  it("moves focus to the first focusable descendant on activation", async () => {
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("first")).toHaveFocus();
    dispose();
  });

  it("cycles Tab from the last element to the first, and Shift+Tab from the first to the last", async () => {
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    await userEvent.click(page.getByTestId("last"));
    await userEvent.keyboard("{Tab}");
    await expect.element(page.getByTestId("first")).toHaveFocus();

    await userEvent.click(page.getByTestId("first"));
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(page.getByTestId("last")).toHaveFocus();

    dispose();
  });

  it("refocuses the container if focus escapes it programmatically", async () => {
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    page.getByTestId("outside-after").element().focus();
    await expect.element(page.getByTestId("first")).toHaveFocus();

    dispose();
  });

  it("does not restore focus on deactivation — that is createFocusRestore's job", async () => {
    // The trap used to own focus restore, behind a `returnFocus` option. Splitting them is
    // what lets a non-modal overlay (Popover, Tooltip, `<Dialog modal={false}>`) restore
    // focus without trapping it. See create-focus-restore.md.
    const { dispose } = mount(() => <TestHarness />);

    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("first")).toHaveFocus();

    // Clicking the toggle focuses it, the still-live trap pulls focus back to `first`, and
    // only then does the click handler deactivate. Focus therefore stays inside the
    // container: nothing returns it to the toggle.
    await userEvent.click(page.getByTestId("toggle"));
    await expect.element(page.getByTestId("first")).toHaveFocus();
    await expect.element(page.getByTestId("toggle")).not.toHaveFocus();

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <TestHarness />);
    await expectNoA11yViolations(container);
    dispose();
  });
});

/**
 * A separate harness, not extra props on the first — do not merge them. The tests above are the
 * gate proving the focus-scope registry changed nothing for a lone trap, which only holds while
 * their tree is untouched.
 *
 * The layer above is a **sibling** container, not a descendant: that is the shape the registry
 * exists for, a `Popover` portaled out of the `Dialog` it was opened in. A nested one would be
 * covered by `container.contains` and prove nothing. The trap stays active and only the scope above
 * toggles, so both answers are measured against one unchanging trap.
 */
function TrapUnderALayer(props: { aboveActive?: boolean }) {
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement>();
  const [aboveRef, setAboveRef] = createSignal<HTMLDivElement>();

  createFocusTrap({ active: () => true, ref: containerRef });
  createFocusScope({ active: () => props.aboveActive === true, ref: aboveRef });

  return (
    <div>
      <button type="button" data-testid="outside">
        Outside
      </button>
      <div data-testid="container" ref={setContainerRef}>
        <button type="button" data-testid="trapped-first">
          Trapped first
        </button>
      </div>
      <div data-testid="above" ref={setAboveRef}>
        <button type="button" data-testid="above-first">
          Above
        </button>
      </div>
    </div>
  );
}

describe("createFocusTrap — a layer above", () => {
  it("leaves alone focus that landed inside a scope registered above it", async () => {
    const { dispose } = mount(() => <TrapUnderALayer aboveActive />);

    // Waiting on the trap's own autofocus is what proves every effect in this tree has flushed —
    // the scope above registers in the same flush, one effect later.
    await expect.element(page.getByTestId("trapped-first")).toHaveFocus();

    page.getByTestId("above-first").element().focus();
    await expect.element(page.getByTestId("above-first")).toHaveFocus();

    // The control, in the same test and against the same live trap: focus that landed outside
    // *every* scope is still pulled back in.
    page.getByTestId("outside").element().focus();
    await expect.element(page.getByTestId("trapped-first")).toHaveFocus();

    dispose();
  });

  it("still yanks focus into a layer that registered no scope", async () => {
    const { dispose } = mount(() => <TrapUnderALayer />);

    await expect.element(page.getByTestId("trapped-first")).toHaveFocus();

    // Same container, same sibling markup — the registration is the only difference, so this is
    // what says the trap consults the registry rather than the DOM shape.
    page.getByTestId("above-first").element().focus();
    await expect.element(page.getByTestId("trapped-first")).toHaveFocus();

    dispose();
  });

  it("resumes yanking once the scope above deactivates", async () => {
    const [aboveActive, setAboveActive] = createSignal(true);
    const { dispose } = mount(() => <TrapUnderALayer aboveActive={aboveActive()} />);

    await expect.element(page.getByTestId("trapped-first")).toHaveFocus();
    page.getByTestId("above-first").element().focus();
    await expect.element(page.getByTestId("above-first")).toHaveFocus();

    // A Popover closing hands authority back to the Dialog underneath it. Without the splice in
    // the scope's cleanup, the trap would stay permanently disarmed for that region of the page.
    flush(() => setAboveActive(false));

    // Deactivating does not itself move focus — nothing in this primitive touches it — and
    // `.focus()` on the already-focused element dispatches no `focusin`, so the trap has had no
    // event to react to yet. Focus has to genuinely leave and come back for this to measure
    // anything.
    page.getByTestId("trapped-first").element().focus();
    page.getByTestId("above-first").element().focus();
    await expect.element(page.getByTestId("trapped-first")).toHaveFocus();

    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <TrapUnderALayer aboveActive />);
    await expectNoA11yViolations(container);
    dispose();
  });
});
