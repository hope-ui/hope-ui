import { describe, expect, it } from "vitest";
import { createRefs } from "../refs";

describe("createRefs", () => {
  it("reads the values it was seeded with", () => {
    const refs = createRefs({ node: "a", count: 1 });

    expect(refs.get("node")).toBe("a");
    expect(refs.get("count")).toBe(1);
  });

  it("writes through to the same backing object", () => {
    const refs = createRefs({ node: "a" });

    refs.set("node", "b");

    expect(refs.get("node")).toBe("b");
  });

  it("holds arbitrary values, including functions and null", () => {
    const handler = () => "called";
    const refs = createRefs<{ handler: (() => string) | null }>({
      handler: null,
    });

    expect(refs.get("handler")).toBeNull();

    refs.set("handler", handler);

    // Nothing here is reactive or unwrapping: a ref returns exactly what was stored, which is
    // what lets a machine keep a callback or a DOM node in `refs` without it being invoked.
    expect(refs.get("handler")).toBe(handler);
  });

  it("gives each instance its own storage", () => {
    const first = createRefs({ node: "a" });
    const second = createRefs({ node: "a" });

    first.set("node", "changed");

    expect(second.get("node")).toBe("a");
  });
});
