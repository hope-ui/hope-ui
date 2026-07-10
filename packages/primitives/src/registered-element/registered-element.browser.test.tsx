import { expectNoA11yViolations, mount } from "@solid-zero/internal-test-utils";
import { createSignal, Show } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createRegisteredElement } from "./registered-element";

/** A descendant that publishes its own DOM element into a signal owned by its ancestor. */
function Child(props: {
  register: (element: Element) => void;
  unregister: (element: Element) => void;
}) {
  const [ref, setRef] = createSignal<HTMLParagraphElement>();
  createRegisteredElement({ ref, register: props.register, unregister: props.unregister });
  return (
    <p ref={setRef} data-testid="child">
      child
    </p>
  );
}

/** Owns the list. `Child` is a separate component, so its writes cross a scope boundary. */
function Parent(props: { show?: boolean; onChange?: (elements: Element[]) => void }) {
  const [elements, setElements] = createSignal<Element[]>([]);

  const publish = (next: Element[]) => {
    setElements(next);
    props.onChange?.(next);
  };

  return (
    <div data-testid="parent" data-count={elements().length}>
      <Show when={props.show ?? true}>
        <Child
          register={(element) => publish([...elements(), element])}
          unregister={(element) => publish(elements().filter((entry) => entry !== element))}
        />
      </Show>
    </div>
  );
}

function count(container: HTMLElement): string | null {
  return container.querySelector('[data-testid="parent"]')?.getAttribute("data-count") ?? null;
}

describe("createRegisteredElement", () => {
  it("registers the element with the ancestor once it exists", async () => {
    const registered: Element[] = [];
    const { container, dispose } = mount(() => (
      <Parent onChange={(elements) => registered.splice(0, registered.length, ...elements)} />
    ));

    await vi.waitFor(() => expect(count(container)).toBe("1"));
    expect(registered[0]).toBe(container.querySelector('[data-testid="child"]'));

    dispose();
  });

  it("does not throw [REACTIVE_WRITE_IN_OWNED_SCOPE] writing to an ancestor's signal", () => {
    // The reason this is a primitive. A plain `props.register(el)` in `Child`'s body is a
    // descendant writing to an ancestor-owned signal, which SolidJS 2.0 throws on.
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      const { dispose } = mount(() => <Parent />);
      dispose();
    }).not.toThrow();

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("unregisters the same element it registered when the owner unmounts", async () => {
    const [show, setShow] = createSignal(true);
    const seen: Element[] = [];
    const { container, dispose } = mount(() => (
      <Parent show={show()} onChange={(elements) => seen.push(...elements)} />
    ));

    await vi.waitFor(() => expect(count(container)).toBe("1"));
    const child = container.querySelector('[data-testid="child"]');

    setShow(false);
    await vi.waitFor(() => expect(count(container)).toBe("0"));
    expect(seen[0]).toBe(child);

    dispose();
  });

  it("registers nothing while the ref is unset", () => {
    const register = vi.fn();
    function NeverRendered() {
      const [ref] = createSignal<HTMLDivElement>();
      createRegisteredElement({ ref, register, unregister: () => {} });
      return <div>no ref here</div>;
    }

    const { dispose } = mount(() => <NeverRendered />);
    expect(register).not.toHaveBeenCalled();
    dispose();
  });

  it("has no baseline accessibility violations", async () => {
    const { container, dispose } = mount(() => <Parent />);
    await vi.waitFor(() => expect(count(container)).toBe("1"));
    await expectNoA11yViolations(container);
    dispose();
  });
});
