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

  it("resolves conflicting hope semantic fills via the registered color scale", () => {
    // The shared twMergeConfig registers hope's semantic tokens as colors, so two fills in the
    // same slot collapse to the last (a base fill overridden by a variant fill).
    const chip = tv({
      base: "bg-primary",
      variants: { tone: { danger: "bg-danger" } },
    });
    const danger = chip({ tone: "danger" });
    expect(danger).toContain("bg-danger");
    expect(danger).not.toContain("bg-primary");
  });
});

describe("tv slot recipe", () => {
  // A slot recipe is used as-is (no adapter): calling it returns one class *function* per slot,
  // which is exactly the theming contract's `SlotRecipeFn` shape.
  const recipe = tv({
    slots: { root: "inline-flex", label: "font-medium" },
    variants: { size: { sm: { root: "h-8" }, md: { root: "h-9" } } },
    defaultVariants: { size: "md" },
  });

  it("returns a class function per slot", () => {
    const result = recipe({ size: "sm" });
    expect(typeof result.root).toBe("function");
    expect(result.root()).toContain("inline-flex");
    expect(result.root()).toContain("h-8");
    expect(result.label()).toContain("font-medium");
  });

  it("merges a consumer class through the slot function", () => {
    expect(recipe().root({ class: "h-12" })).toContain("h-12");
    expect(recipe().root({ class: "h-12" })).not.toContain("h-9");
  });
});
