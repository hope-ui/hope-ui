/**
 * The theming **contract** — the shared vocabulary `@hope-ui/components` reads through
 * `useRecipe` and every theme (`@hope-ui/themes/*` or a third-party package) implements and
 * augments. Pure types + one constant; imports nothing and emits no CSS.
 *
 * It is deliberately **empty of any component knowledge**. No component's API or styling has been
 * designed yet, so this pins *no* recipe names and *no* variant values — those belong to whoever
 * builds a component, added later by augmentation. What it fixes is only the *shape* a recipe
 * takes and the machinery to register/read them.
 *
 * **Every recipe is a slot recipe.** hope-ui has no single-class recipe form: even a component
 * with one visual part uses a slot recipe, and that part is the `"root"` slot (the default type
 * parameter below). This keeps every component's styling uniform — a consumer/theme always deals
 * in `recipe(props).<slot>`, never a bare string for some components and a record for others.
 *
 * Components/themes populate the registry by augmentation:
 * ```ts
 * declare module "@hope-ui/theming" {
 *   interface ThemeRecipes {
 *     // one entry per component; the variant vocabulary is that component's own decision
 *     accordion: SlotRecipeFn<{ size?: "sm" | "md" }, "root" | "item" | "trigger">;
 *   }
 * }
 * ```
 */

/**
 * A slot recipe: variant props → one class string per slot. `Slot` defaults to `"root"` for a
 * single-part component (the only slot it has). A slot recipe is emitted as a unit by Panda — once
 * the recipe is used at a variant combination, every slot's CSS for that combination is emitted.
 */
export type SlotRecipeFn<Variants, Slot extends string = "root"> = (
  props?: Variants,
) => Record<Slot, string>;

/**
 * The augmentable registry of recipes. Empty by design — components and themes add their own
 * entries via `declare module "@hope-ui/theming"`. `useRecipe` is keyed off this, so a recipe is
 * only reachable once something has registered it.
 */
// biome-ignore lint/suspicious/noEmptyInterface: intentionally empty — populated by augmentation.
export interface ThemeRecipes {}

/**
 * The theming contract version. A theme asserts against it (e.g. in its conformance test) so a
 * preset built against a different contract shape fails loudly rather than drifting silently — a
 * Panda preset carries no TS-contract awareness on its own. Bump on any breaking change to the
 * recipe shape or the registry mechanics.
 */
export const THEMING_CONTRACT_VERSION = 1 as const;
