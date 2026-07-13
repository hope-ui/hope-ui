import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { expectNoA11yViolations } from "../../axe/axe";
import { mount } from "../mount";

/** Reads a reactive value in its render body, outside any tracking scope. */
function UntrackedRead() {
  const [value] = createSignal("read me");
  const message = value();
  return <p>{message}</p>;
}

/** Writes to a signal owned by an ancestor's reactive scope, from its own render body. */
function OwnedScopeWrite(props: { register: (value: string) => void }) {
  props.register("written");
  return <p>child</p>;
}

function OwnedScopeParent() {
  const [registered, setRegistered] = createSignal<string>();
  return (
    <div data-registered={registered()}>
      <OwnedScopeWrite register={setRegistered} />
    </div>
  );
}

describe("mount", () => {
  it("attaches the container to the document", () => {
    const { container, dispose } = mount(() => {
      const el = document.createElement("p");
      el.textContent = "hello";
      return el;
    });

    expect(document.body.contains(container)).toBe(true);
    dispose();
  });

  it("removes the container from the document on dispose", () => {
    const { container, dispose } = mount(() => document.createTextNode("hi"));
    dispose();
    expect(document.body.contains(container)).toBe(false);
  });

  it("fails on dispose when SolidJS emits [STRICT_READ_UNTRACKED]", () => {
    // The invariant this harness exists to enforce. `STRICT_READ_UNTRACKED` is the one
    // diagnostic that catches the conditionally-rendered-ref race documented in CLAUDE.md,
    // and it is worthless as a signal while 170 known-benign ones scroll past every run.
    const { dispose } = mount(() => <UntrackedRead />);
    expect(() => dispose()).toThrow(/STRICT_READ_UNTRACKED/);
  });

  it("still unmounts the tree when a diagnostic fails the dispose", () => {
    const { container, dispose } = mount(() => <UntrackedRead />);
    expect(() => dispose()).toThrow();
    expect(document.body.contains(container)).toBe(false);
  });

  it("rethrows [REACTIVE_WRITE_IN_OWNED_SCOPE] out of mount, and restores the console", () => {
    // Solid throws this one rather than logging it, so it escapes `solidRender` directly.
    // What matters here is that `mount` doesn't leave `console.warn`/`console.error` patched
    // on its way out — a later test spying on either would otherwise see a stale wrapper.
    const warn = console.warn;
    const error = console.error;

    expect(() => mount(() => <OwnedScopeParent />)).toThrow(/REACTIVE_WRITE_IN_OWNED_SCOPE/);

    expect(console.warn).toBe(warn);
    expect(console.error).toBe(error);
  });

  it("fails on dispose when a diagnostic is reported as a caught Error on console.error", () => {
    // Solid catches a throw raised inside an effect and re-reports it as `console.error(err)`
    // — an `Error`, not a string. Reproduced directly rather than through a contrived
    // component, since the shape of that console call is the whole contract being pinned.
    const { dispose } = mount(() => document.createTextNode("hi"));

    console.error(
      new Error("[REACTIVE_WRITE_IN_OWNED_SCOPE] Writing to reactive state inside an owned scope"),
    );

    expect(() => dispose()).toThrow(/REACTIVE_WRITE_IN_OWNED_SCOPE/);
  });

  it("leaves an unrelated console.warn alone, and keeps a test's own spy working", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { dispose } = mount(() => document.createTextNode("hi"));

    console.warn("a perfectly ordinary warning");

    expect(() => dispose()).not.toThrow();
    expect(consoleWarn).toHaveBeenCalledWith("a perfectly ordinary warning");
    consoleWarn.mockRestore();
  });

  it("has no baseline accessibility violations", async () => {
    // `check:coverage-parity` requires this of every browser test that calls `mount()` — this
    // file included, even though what it mounts is deliberately trivial.
    const { container, dispose } = mount(() => {
      const button = document.createElement("button");
      button.textContent = "Click me";
      return button;
    });

    await expectNoA11yViolations(container);
    dispose();
  });
});
