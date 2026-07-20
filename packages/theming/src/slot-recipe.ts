/**
 * What a recipe *is* — the generic shape every hope-ui recipe takes, independent of any component.
 *
 * A recipe is a `tailwind-variants` slot recipe (see `../styling/styling`'s `tv`) used **directly**
 * (no adapter): calling it with variant props returns one class *function* per slot. Each
 * component's contract in this folder specializes this with its variant vocabulary and slot names.
 */
import type { ClassValue } from "tailwind-variants";

/**
 * One slot's class resolver — the function `tailwind-variants` returns per slot. Call it for the
 * slot's classes, or pass `{ class }` to merge a consumer override through the recipe's own
 * tailwind-merge conflict resolution.
 */
export type SlotClassFn = (props?: { class?: ClassValue }) => string;

/**
 * A slot recipe: variant props → one {@link SlotClassFn} per slot. `Slot` defaults to `"root"` for
 * a single-part component. This is exactly the shape a `tv({ slots, … })` recipe returns, so a
 * theme registers its `tv` recipe as-is.
 */
export type SlotRecipeFn<Variants, Slot extends string = "root"> = (
  props?: Variants,
) => Record<Slot, SlotClassFn>;
