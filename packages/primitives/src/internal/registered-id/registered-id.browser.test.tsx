import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { createSignal, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createRegisteredId } from "./registered-id";

/** A descendant that publishes its id into a signal owned by its ancestor's scope. */
function Child(props: { id?: string | false; register: (id: string | undefined) => void }) {
  createRegisteredId({ id: () => props.id, register: props.register });
  return <p id={props.id || undefined}>child</p>;
}

/**
 * Owns the signal, and reflects whatever gets registered onto its own `aria-describedby` —
 * the real shape of the pattern, and how the test observes it. `Child` is a separate
 * component, so its writes cross a reactive-scope boundary.
 */
function Parent(props: { id?: string | false; show?: boolean }) {
  const [registeredId, setRegisteredId] = createSignal<string | undefined>();

  return (
    <div data-testid="parent" aria-describedby={registeredId()}>
      <Show when={props.show ?? true}>
        <Child id={props.id} register={setRegisteredId} />
      </Show>
    </div>
  );
}

function describedBy(container: HTMLElement): string | null {
  const parent = container.querySelector('[data-testid="parent"]');
  return parent?.getAttribute("aria-describedby") ?? null;
}

describe("createRegisteredId", () => {
  it("registers the id with the ancestor after mount", async () => {
    const { container, dispose } = mount(() => <Parent id="child-id" />);

    await vi.waitFor(() => expect(describedBy(container)).toBe("child-id"));
    dispose();
  });

  it("does not throw [REACTIVE_WRITE_IN_OWNED_SCOPE] writing to an ancestor's signal", () => {
    // The reason this is a primitive. A plain `props.register(props.id)` in `Child`'s body
    // is a descendant writing to an ancestor-owned signal, which SolidJS 2.0 throws on.
    // `createRegisteredId` defers the write into `onSettled`, out of that call stack.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      const { dispose } = mount(() => <Parent id="child-id" />);
      dispose();
    }).not.toThrow();

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("unregisters when the registering component unmounts", async () => {
    const [show, setShow] = createSignal(true);
    const { container, dispose } = mount(() => <Parent id="child-id" show={show()} />);

    await vi.waitFor(() => expect(describedBy(container)).toBe("child-id"));

    setShow(false);
    await vi.waitFor(() => expect(describedBy(container)).toBeNull());

    dispose();
  });

  it("registers `undefined` for an absent id", async () => {
    const { container, dispose } = mount(() => <Parent />);

    await vi.waitFor(() => expect(describedBy(container)).toBeNull());
    dispose();
  });

  it("registers `undefined` for `false` (dom-expressions' omit-this-attribute value)", async () => {
    const { container, dispose } = mount(() => <Parent id={false} />);

    await vi.waitFor(() => expect(describedBy(container)).toBeNull());
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <Parent id="child-id" />);
    await vi.waitFor(() => expect(describedBy(container)).toBe("child-id"));
    await expectNoA11yViolations(container);
    dispose();
  });
});
