import type { CalendarRecipeVariants, CalendarSize } from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { calendarRecipe } from "../calendar";

const SIZES: CalendarSize[] = ["sm", "md", "lg"];
const SLOTS = [
  "root",
  "header",
  "heading",
  "prevButton",
  "nextButton",
  "grid",
  "weekday",
  "cell",
  "cellTrigger",
] as const;

describe("hope calendar recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    const cases: CalendarRecipeVariants[] = [
      undefined as unknown as CalendarRecipeVariants,
      ...SIZES.map((size) => ({ size })),
    ];
    assertSlotRecipeConformance(calendarRecipe, { cases, slots: SLOTS });
  });

  it("renders a plain in-flow calendar with no popup chrome by default (standalone-first)", () => {
    const root = calendarRecipe({}).root();
    // Structural only: it stacks header over grid, legible content color, non-selectable targets.
    expect(root).toContain("flex");
    expect(root).toContain("flex-col");
    expect(root).toContain("text-foreground");
    expect(root).toContain("select-none");
    // Deliberately NOT an elevated/floating panel — that chrome belongs to a DatePicker popover or a
    // consumer override, not the standalone default.
    expect(root).not.toContain("bg-surface-overlay");
    expect(root).not.toContain("border");
    expect(root).not.toContain("shadow");
    expect(root).not.toContain("rounded");
  });

  it("paints day selection through the data-* state hooks, never hover/bare-focus", () => {
    const cell = calendarRecipe({}).cellTrigger();
    // Selection + range are the registered day-state variants — the cursor's position never paints
    // them.
    expect(cell).toContain("data-selected:bg-primary");
    expect(cell).toContain("data-selected:text-on-primary");
    expect(cell).toContain("data-range-middle:bg-selected");
    expect(cell).toContain("data-range-middle:text-on-selected");
    expect(cell).toContain("data-highlighted:bg-selected");
    expect(cell).toContain("data-today:bg-active");
    // The hover wash is written zero-specificity (`:where(:hover)`) so it ranks equal to the `data-*`
    // fills and, placed before them, loses to any selection/range/today paint under the pointer — a
    // bare `hover:` would outrank them all. It must not paint any selection color, and there is no
    // bare-focus background.
    expect(cell).toContain("[&:where(:hover)]:bg-surface-raised-hovered");
    expect(cell).not.toContain("hover:bg-primary");
    expect(cell).not.toContain("hover:bg-selected");
    expect(cell).not.toContain("focus:bg-");
    // The zero-spec hover must sit before every state fill so source order lets the fills win.
    expect(cell.indexOf("[&:where(:hover)]")).toBeLessThan(
      cell.indexOf("data-selected:bg-primary"),
    );
  });

  it("orders day state so the later utility wins the zero-specificity cascade", () => {
    const cell = calendarRecipe({}).cellTrigger();
    // `today` is a soft tint that a real selection must override → it comes before `selected`.
    expect(cell.indexOf("data-today:")).toBeLessThan(cell.indexOf("data-selected:bg-primary"));
    // The tentative preview comes before `selected` so the range anchor (selected AND highlighted)
    // stays the solid pill, not the light band.
    expect(cell.indexOf("data-highlighted:")).toBeLessThan(
      cell.indexOf("data-selected:bg-primary"),
    );
    // The range middle band comes after `selected` (a middle day that also reports selected reads as
    // the band) but before the solid endpoints (which must beat the middle).
    expect(cell.indexOf("data-selected:bg-primary")).toBeLessThan(
      cell.indexOf("data-range-middle:"),
    );
    expect(cell.indexOf("data-range-middle:")).toBeLessThan(cell.indexOf("data-range-start:"));
    expect(cell.indexOf("data-range-middle:")).toBeLessThan(cell.indexOf("data-range-end:"));
  });

  it("rounds the range endpoints and squares the middle for a continuous band (logical, RTL-safe)", () => {
    const cell = calendarRecipe({}).cellTrigger();
    expect(cell).toContain("rounded-md"); // the isolated single-day base
    // Logical radii so the band rounds on the leading edge under RTL: the endpoints round their outer
    // side and square their inner side to sit flush against the middle band.
    expect(cell).toContain("data-range-start:rounded-s-md");
    expect(cell).toContain("data-range-start:rounded-e-none");
    expect(cell).toContain("data-range-end:rounded-e-md");
    expect(cell).toContain("data-range-end:rounded-s-none");
    expect(cell).toContain("data-range-middle:rounded-none");
    // The tentative preview is squared too, so it reads as one continuous band, not separate pills.
    expect(cell).toContain("data-highlighted:rounded-none");
    // A single-day range re-rounds both sides.
    expect(cell).toContain("[&[data-range-start][data-range-end]]:rounded-md");
  });

  it("mutes outside-month days and strikes unavailable ones through tokens", () => {
    const cell = calendarRecipe({}).cellTrigger();
    expect(cell).toContain("data-outside-month:text-foreground-subtle");
    expect(cell).toContain("data-unavailable:line-through");
    expect(cell).toContain("data-unavailable:text-foreground-disabled");
  });

  it("dims and de-activates a disabled day through the opacity-disabled token", () => {
    const cell = calendarRecipe({}).cellTrigger();
    expect(cell).toContain("data-disabled:pointer-events-none");
    expect(cell).toContain("data-disabled:opacity-disabled");
  });

  it("gives the day trigger the shared roving focus ring + border (reused from Button)", () => {
    const cell = calendarRecipe({}).cellTrigger();
    expect(cell).toContain("focus-visible:outline-none");
    expect(cell).toContain("focus-visible:border-focus");
    expect(cell).toContain("focus-visible:ring-3");
    expect(cell).toContain("focus-visible:ring-focus-halo");
  });

  it("mutes the weekday head at the fixed nova text size", () => {
    const weekday = calendarRecipe({}).weekday();
    expect(weekday).toContain("text-foreground-muted");
    expect(weekday).toContain("text-[0.8rem]");
    expect(weekday).toContain("font-normal");
  });

  it("styles the heading and nav buttons as ghost — hover wash + token dim, no fill", () => {
    const parts = calendarRecipe({});
    for (const slot of ["heading", "prevButton", "nextButton"] as const) {
      const cls = parts[slot]();
      expect(cls).toContain("hover:bg-surface-raised-hovered");
      expect(cls).toContain("data-disabled:opacity-disabled");
      expect(cls).toContain("focus-visible:ring-focus-halo");
      // Ghost: no solid fill of its own.
      expect(cls).not.toContain("bg-primary");
    }
    // The heading is the flexible caption — it fills the header width between the nav buttons.
    expect(parts.heading()).toContain("flex-1");
  });

  it("keeps one grid footprint across views (table-fixed at the month width)", () => {
    const grid = calendarRecipe({}).grid();
    expect(grid).toContain("table-fixed");
    expect(grid).toContain("w-[calc(var(--cell-size)*7)]");
    expect(grid).toContain("border-collapse");
    // No per-view branching — one width for month/year/decade, so year/decade keep the month footprint.
    expect(grid).not.toContain("data-view");
  });

  it("scales density per size via --cell-size on root, each size self-contained", () => {
    // sm: 32px day box (via --cell-size), tighter nav button.
    const sm = calendarRecipe({ size: "sm" });
    expect(sm.root()).toContain("[--cell-size:2rem]");
    expect(sm.cellTrigger()).toContain("text-xs");
    expect(sm.prevButton()).toContain("size-7");

    // lg: 40px day box, roomier nav button.
    const lg = calendarRecipe({ size: "lg" });
    expect(lg.root()).toContain("[--cell-size:2.5rem]");
    expect(lg.cellTrigger()).toContain("text-base");
    expect(lg.prevButton()).toContain("size-9");

    // The day box is view-independent: the button fills its column (width = --cell-size), so it carries
    // no per-size `size-N` — only the text size changes.
    expect(sm.cellTrigger()).toContain("h-(--cell-size)");
    expect(sm.cellTrigger()).toContain("w-full");
    expect(sm.cellTrigger()).not.toMatch(/\bsize-\d/);
  });

  it("defaults to the md size when no size is passed", () => {
    const parts = calendarRecipe({});
    expect(parts.root()).toContain("[--cell-size:2.25rem]"); // md, 36px
    expect(parts.cellTrigger()).toContain("text-sm"); // md
    expect(parts.prevButton()).toContain("size-8"); // md
    // Only the md density is applied — no sm/lg cell-size endpoints leak in.
    expect(parts.root()).not.toContain("[--cell-size:2rem]");
    expect(parts.root()).not.toContain("[--cell-size:2.5rem]");
    expect(parts.cellTrigger()).not.toContain("text-base");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    const cases: CalendarRecipeVariants[] = [{}, ...SIZES.map((size) => ({ size }))];
    for (const variants of cases) {
      const parts = calendarRecipe(variants);
      for (const slot of SLOTS) {
        const cls = parts[slot]();
        expect(cls).not.toContain("color-mix");
        // Alpha modifier on a color utility (`bg-x/50`).
        expect(cls).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
        // Magic opacity (`opacity-90`); the `opacity-disabled` token has no digits, so it is exempt.
        expect(cls).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
      }
    }
  });

  it("merges a consumer class through the cellTrigger slot function", () => {
    // Override the base `font-normal` — a utility with no variant twin, so the assertion proves the
    // consumer class both lands and wins tailwind-merge (unlike `rounded-none`, which a range-middle
    // variant already carries and would satisfy trivially).
    const merged = calendarRecipe({ size: "md" }).cellTrigger({ class: "font-bold" });
    expect(merged).toContain("font-bold");
    expect(merged).not.toContain("font-normal");
  });
});
