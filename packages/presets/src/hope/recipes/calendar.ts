/*
 * @hope-ui/presets/hope — Calendar slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Calendar` reads through
 * `useRecipe("calendar")`. It paints shadcn/ui's "nova" calendar — a plain, in-flow date picker
 * (navigation header over a month grid) — entirely through hope's semantic `--hope-*` tokens.
 * Calendar is **standalone-first**, like Listbox: the default carries **no elevated / popup chrome**
 * (no surface background, border, shadow, or rounded panel). A consumer that floats it in a popover
 * (a future DatePicker) supplies that surface itself; it is deliberately not baked into the default.
 * Calendar is a **neutral date surface** (no color axis) — the only accents are the selection and the
 * range / tentative-hover bands, all driven by tokens, not a variant.
 *
 * ── Day-cell state is `data-*` ONLY — never `hover:` / bare `:focus` for selection ────────────────
 * `createCalendarCell` emits the canonical registered day-state hooks — `data-today`,
 * `data-outside-month`, `data-selected`, `data-range-start`/`-middle`/`-end`, `data-highlighted` (the
 * tentative hover-range band), `data-disabled` — so the cell is painted by those custom variants, not
 * by the cursor's physical position. Only the plain surface wash (`hover:bg-surface-raised-hovered`)
 * is a real hover — it reads a day under the pointer without competing with the selection state.
 *
 * The `data-*` utilities are ordered so the **later** one wins the zero-specificity `:where(...)`
 * cascade (see `_base/_variants.css`): `data-today` (a soft tint) comes first, then the range middle /
 * tentative band, then the solid selected endpoints last — so a day that is both today and selected,
 * or an endpoint that is also a middle, reads as the stronger state. (`data-unavailable` is a
 * registered hook the primitive does not yet emit; its strike-through style is authored here anyway —
 * a pure, harmless no-op until Phase 3 reconciles the cell's emitted attributes.)
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a finished `--hope-*` token: `bg-primary`/`text-on-primary` (the solid selection),
 * `bg-selected`/`text-on-selected` (the range + tentative band), `bg-active` (today's tint),
 * `bg-surface-raised-hovered` (the day/nav hover wash), `text-foreground`/`-muted`/`-subtle`/
 * `-disabled` (content + muted weekday + outside-month + unavailable text), `ring-focus-halo` (the
 * roving focus ring, reused from Button), `opacity-disabled` (the disabled dim — an opacity *token*,
 * not a magic number). The recipe computes no color — no `color-mix`, no alpha modifier, no magic
 * opacity. `ring-[3px]` / `text-[0.8rem]` are raw arbitrary sizes (no `--hope-*`/`color-mix`
 * reference), so the purity scan leaves them alone. Every class is a literal so the `@source` scan
 * sees it.
 *
 * ── Single axis: `size` (density) ───────────────────────────────────────────────────────────────
 * Every density value (the day-cell box + text, and the navigation-button box + glyph) lives *only*
 * in the `size` variants — `sm`, `md`, and `lg` each carry their full, self-contained set. The base
 * slots carry **no** competing box/text class, so a size applies additively and nothing depends on
 * tailwind-merge stripping a base class. The weekday `<th>` in a `<table>` auto-aligns to its
 * column's cell width, so it needs no per-size width — its `text-[0.8rem]` stays size-independent.
 */

// The Calendar recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/**
 * hope's Calendar slot recipe — used as-is by the component (`recipe(props).cellTrigger()`), no
 * adapter. `hopeRecipes` (in `./index`) checks it against the `calendar` contract in `@hope-ui/theming`.
 */
export const calendarRecipe = tv({
  slots: {
    // The `role="group"` container. Deliberately NO popup chrome (no background, border, shadow, or
    // rounded panel) — a standalone calendar sits in the page flow; a floating consumer layers the
    // surface itself. Stacks the navigation header over the grid; `text-foreground` is the legible
    // base content color; `select-none` because day cells are pointer/keyboard targets, not text.
    root: "inline-flex flex-col gap-2 text-foreground select-none",
    // The navigation row: prev — heading — next, spread edge to edge.
    header: "flex items-center justify-between gap-2 pb-2",
    // The center caption `<button>` (the current month/year — a view-switcher trigger). Ghost: only a
    // surface hover wash, no fill; focus shows the shared roving ring; disabled dims via the token.
    heading:
      "inline-flex items-center justify-center rounded-md px-2 py-1 font-medium hover:bg-surface-raised-hovered focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-halo data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // Previous-period nav `<button>` — a ghost, square icon button. Box + glyph size live per `size`.
    prevButton:
      "inline-flex items-center justify-center rounded-md hover:bg-surface-raised-hovered focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-halo data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // Next-period nav `<button>` — the mirror of `prevButton`.
    nextButton:
      "inline-flex items-center justify-center rounded-md hover:bg-surface-raised-hovered focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-halo data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // The `<table role="grid">`. `border-collapse` so range-band cells sit flush with no seams.
    grid: "w-full border-collapse",
    // A weekday-head `<th scope="col">` — small, muted, non-interactive. Size-independent (the table
    // column width is set by the day cell below), so its text stays fixed at the nova `0.8rem`.
    weekday: "pb-1 text-[0.8rem] font-normal text-foreground-muted",
    // A `<td role="gridcell">` wrapping the day trigger — no cell padding, so the trigger box defines
    // the column. `relative` in case a consumer overlays a marker; text centered under the trigger.
    cell: "relative p-0 text-center",
    // The roving day `<button>`. All day state is `data-*` (see the header note); ORDER MATTERS — the
    // later utility wins the zero-specificity cascade:
    //  base metrics + rounded corners → surface hover wash → roving focus ring (reused from Button) →
    //  today tint → outside-month/unavailable text → disabled dim → range middle + tentative band →
    //  solid selected endpoints last (so selection beats today, and endpoints beat the middle).
    // Box + text size live per `size`, not here.
    cellTrigger: [
      "relative inline-flex items-center justify-center rounded-md font-normal select-none",
      "hover:bg-surface-raised-hovered",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-focus-halo",
      "data-today:bg-active",
      "data-outside-month:text-foreground-subtle",
      "data-unavailable:line-through data-unavailable:text-foreground-disabled",
      "data-disabled:pointer-events-none data-disabled:opacity-disabled",
      "data-range-middle:bg-selected data-range-middle:text-on-selected data-range-middle:rounded-none",
      "data-highlighted:bg-selected",
      "data-selected:bg-primary data-selected:text-on-primary",
      "data-range-start:bg-primary data-range-start:text-on-primary data-range-start:rounded-l-md",
      "data-range-end:bg-primary data-range-end:text-on-primary data-range-end:rounded-r-md",
    ],
  },
  variants: {
    // `size` owns the full density set — the day-cell box + text, and the navigation-button box +
    // glyph. Each size is self-contained (the base carries no competing box/text class), so a size
    // applies additively and nothing relies on tailwind-merge resolution. The weekday text is
    // size-independent (its column auto-sizes to the day cell), so it is not touched here.
    size: {
      sm: {
        prevButton: "size-7 [&_svg]:size-4",
        nextButton: "size-7 [&_svg]:size-4",
        heading: "text-sm",
        cellTrigger: "size-8 text-xs",
      },
      md: {
        prevButton: "size-8 [&_svg]:size-4",
        nextButton: "size-8 [&_svg]:size-4",
        heading: "text-sm",
        cellTrigger: "size-9 text-sm",
      },
      lg: {
        prevButton: "size-9 [&_svg]:size-5",
        nextButton: "size-9 [&_svg]:size-5",
        heading: "text-base",
        cellTrigger: "size-10 text-base",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
