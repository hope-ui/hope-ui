import { createSignal, flush, merge } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { mergeProps } from "../merge-props";

// Ported from `@zag-js/solid`'s `tests/merge-props.test.ts`. Two upstream spellings are gone in
// SolidJS 2.0 and are respelled here: `mergeProps` (the framework one) is `merge`, and
// `createComputed` no longer exists — the reactive cases read through `flush()` instead, which is
// also what the client build requires for a write to be visible to the next read.
describe("mergeProps", () => {
  it("handles one argument", () => {
    const onClick = () => {};

    const props = mergeProps({ onClick, className: "primary", id: "test_id" });

    expect(props.onClick).toBe(onClick);
    expect(props.className).toBe("primary");
    expect(props.id).toBe("test_id");
  });

  it("combines handlers", () => {
    const handler = vi.fn();

    const props = mergeProps({ onClick: handler }, { onClick: handler }, { onClick: handler });
    props.onClick();

    expect(handler).toHaveBeenCalledTimes(3);
  });

  it("combines css classes", () => {
    const props = mergeProps({ class: "primary" }, { class: "hover" }, { class: "focus" });
    expect(props.class).toBe("primary hover focus");

    const aliased = mergeProps(
      { className: "primary" },
      { className: "hover" },
      { className: "focus" },
    );
    expect(aliased.className).toBe("primary hover focus");
  });

  it("routes data-ownedby through the composing branch, where the last source still wins", () => {
    // Upstream's own test expects the union `"toggle-group tooltip popover"`, and fails here.
    // That is a version skew, not a port defect: `data-ownedby` gets a dedicated union branch in
    // `@zag-js/core` on `main`, but not in the published `1.42.0` this fork is pinned to, where
    // `mergeProps` falls through to last-value-wins. Pinning the assertion to the *installed*
    // behavior means the day the core dependency is bumped past that change, this test is the
    // thing that says so.
    const props = mergeProps(
      { "data-ownedby": "toggle-group tooltip" },
      { "data-ownedby": "tooltip popover" },
    );

    expect(props["data-ownedby"]).toBe("tooltip popover");
  });

  it("combines styles", () => {
    const stringStyles = `
        margin: 24px;
        padding: 2;
        background-image: url("http://example.com/image.png");
        border: 1px solid #123456;
        --x: 123;
      `;

    const props = mergeProps(
      { style: stringStyles },
      { style: { margin: "10px", "font-size": "2rem" } },
    );

    expect(props.style).toMatchInlineSnapshot(`
      {
        "--x": "123",
        "background-image": "url("http://example.com/image.png")",
        "border": "1px solid #123456",
        "font-size": "2rem",
        "margin": "10px",
        "padding": "2",
      }
    `);
  });

  it("last value overwrites the event-listener key", () => {
    const props = mergeProps(
      { onEvent: () => "first" },
      { onEvent: () => "second" },
      { onEvent: "overwrites" },
    );

    expect(props.onEvent).toBe("overwrites");
  });

  it("survives being merged again by SolidJS's own merge", () => {
    const first = vi.fn();
    const second = vi.fn();

    const merged = merge(mergeProps({ onClick: first }, { onClick: second }));
    merged.onClick("foo");

    expect(first).toHaveBeenCalledExactlyOnceWith("foo");
    expect(second).toHaveBeenCalledExactlyOnceWith("foo");
  });

  it("accepts function sources and re-reads them on every access", () => {
    const [source, setSource] = createSignal<any>({
      class: "primary",
      style: { margin: "10px" },
    });

    const props = mergeProps(source, { class: "secondary" }, { style: { padding: "10px" } });

    expect(props.class).toBe("primary secondary");
    expect(props.style).toEqual({ margin: "10px", padding: "10px" });

    flush(() => setSource({ class: "tertiary", foo: "bar" }));

    expect(props.class).toBe("tertiary secondary");
    expect(props.style).toEqual({ padding: "10px" });
  });

  it("merges a function source with an override object", () => {
    const [value, setValue] = createSignal("initial");

    const merged = mergeProps(() => ({ id: "base", value: value(), class: "base-class" }), {
      class: "override-class",
      disabled: true,
    });

    expect(merged.id).toBe("base");
    expect(merged.value).toBe("initial");
    expect(merged.class).toBe("base-class override-class");
    expect(merged.disabled).toBe(true);

    flush(() => setValue("updated"));

    expect(merged.value).toBe("updated");
    expect(merged.class).toBe("base-class override-class");
  });
});
