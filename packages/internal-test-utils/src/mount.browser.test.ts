import { describe, expect, it } from "vitest";
import { mount } from "./mount";

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
});
