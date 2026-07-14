import { describe, expect, it } from "vitest";
import { cn, cx, tv } from "../styling";

describe("cn", () => {
  it("resolves conflicting Tailwind utilities (last wins)", () => {
    const merged = cn("p-2", "p-4");
    expect(merged).toContain("p-4");
    expect(merged).not.toContain("p-2");
  });

  it("keeps non-conflicting utilities", () => {
    expect(cn("flex", "p-4")).toContain("flex");
    expect(cn("flex", "p-4")).toContain("p-4");
  });
});

describe("cx", () => {
  it("concatenates without resolving conflicts", () => {
    expect(cx("p-2", "p-4")).toBe("p-2 p-4");
  });
});

describe("tv", () => {
  it("produces base + selected variant classes", () => {
    const button = tv({
      base: "inline-flex",
      variants: { size: { sm: "h-8", md: "h-10" } },
      defaultVariants: { size: "md" },
    });
    const sm = button({ size: "sm" });
    expect(sm).toContain("inline-flex");
    expect(sm).toContain("h-8");
    expect(button()).toContain("h-10");
  });

  it("merges a passed class over the recipe output (tailwind-merge)", () => {
    const box = tv({ base: "p-2" });
    expect(box({ class: "p-6" })).toContain("p-6");
    expect(box({ class: "p-6" })).not.toContain("p-2");
  });
});
