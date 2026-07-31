import {
  type CreateComboboxOptions,
  type CreateComboboxReturn,
  createCombobox,
} from "@hope-ui/primitives/combobox";
import { HiddenSelect } from "@hope-ui/primitives/hidden-select";
import type { SelectionMode } from "@hope-ui/primitives/internal";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { SelectSize, SelectThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { CheckIcon, ChevronDownIcon } from "../icons";
import { SelectContext, type SelectContextValue } from "./select-context";

/**
 * `SelectRootProps` = the kernel's `CreateComboboxOptions` (the `items` data, the value/selection
 * surface, open state, modality, the dismissal toggles, the whole positioning surface and the native
 * form fields) **plus** the themeable `size` axis and the two chrome glyphs (`SelectThemeableProps`,
 * owned by `@hope-ui/theming`) **plus** the per-instance props below. Extending
 * `SelectThemeableProps` keeps the recipe variants and this surface in lockstep by construction.
 *
 * `<V>` is your item type, `<M>` the selection mode (inferred from `selectionMode`, which is what
 * types `value`/`defaultValue`/`onChange` as a scalar or an array), and `<G>` the shape of an `items`
 * **entry** — the same as `<V>` for a flat list, and the group's shape with `groupToItems` set.
 *
 * `Root` renders **no host element** — it resolves the recipe variants once, shares the slot class
 * fns plus the two glyphs on context, and renders its children beside the hidden native field. Three
 * consequences, all deliberate:
 *
 * - **No `class` prop.** Select has no `root` slot, so a root-only class would have nothing to apply
 *   to (the reason `Dialog.Root`'s was removed). Style the parts, or reach every one at once with
 *   `slotClasses`.
 * - **No `render` prop, and no native-attribute passthrough.** A part that renders no element of its
 *   own is the one exemption to the forwarding rule.
 * - **No hand-kept `omit` list**, for the same reason — the drift bug `Calendar.Root`/`Listbox.Root`
 *   carry. `Popover.Root` is the precedent *and* the warning: don't "fix" that by adding one.
 *
 * **Virtualization is deliberately absent** (`estimateSize`/`overscan` are `Omit`-ted). A windowed
 * row is *recycled*, so its position changes while it stays mounted and only the row itself knows
 * it — which is why `Listbox.Item` takes an `index`. `Select.Item` takes only `item` and resolves its
 * own row through `indexOfValue`, which is `-1` by construction in virtual mode. Excluding the option
 * from the type is what turns "every row silently warns and nothing registers" into a compile error.
 * A virtualized picker is `Listbox`'s job today.
 */
export interface SelectRootProps<V = unknown, M extends SelectionMode = "single", G = V>
  extends Omit<CreateComboboxOptions<V, M, G>, "estimateSize" | "overscan">,
    SelectThemeableProps {
  /**
   * Per-instance class overrides, keyed by slot (`trigger`/`value`/`icon`/`positioner`/`content`/
   * `list`/`group`/`groupLabel`/`separator`/`item`/`itemText`/`itemIndicator`). Folded in after the
   * recipe base and the preset's global `slotClasses`. Set once here to reach every part. Use literal
   * class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"select">;
  children?: JSX.Element;
}

/**
 * The Select root. Calls `createCombobox` once for the shared kernel (open state + the eagerly-created
 * listbox over the `items` data + ids + element registries + the floating layer + the shared
 * presence), resolves the recipe variants via `useDefaults` + `useSlots`, and puts the state, the
 * slot class fns and the two default glyphs on context (composition — `ctx.state` + `ctx.slots`, not
 * an extended state). Renders only the provider and the hidden native field, so the trigger's SSR
 * hydration key is unaffected by this component.
 *
 * **Options are data, and nothing renders until open.** `items` is the whole option set, held here
 * rather than in the popup — which is what lets a closed Select still do typeahead, still guard
 * `allowsEmptyCollection`, and still server-render every `<option>` for autofill, without mounting a
 * single row the user may never open. Tabbing a form with ten Selects mounts zero option lists.
 *
 * **The visual positioning defaults land here, not in the kernel.** `createCombobox` applies none: a
 * gap from the trigger and a viewport gutter are *look-and-feel*, so they belong where a preset's
 * `defaultProps.select` can reach them, while a headless consumer of `@hope-ui/primitives/combobox`
 * keeps floating-ui's own zeroes. Popover's Root draws the same line.
 *
 * **The trigger needs an accessible name.** Select ships no `Label` part (labelling is a future
 * `Field`'s job), so an `aria-label` — or an `aria-labelledby` pointing at the consumer's own
 * `<label>` — on `Select.Trigger` is mandatory: a nameless `role="combobox"` is an axe
 * `aria-input-field-name` violation, and so is the `role="listbox"` that inherits its name.
 *
 * Because it reads a recipe, a `Select.Root` **requires a `<ThemeProvider>`** ancestor fed a preset,
 * like every other styled component.
 */
export function Root<V = unknown, M extends SelectionMode = "single", G = V>(
  props: SelectRootProps<V, M, G>,
): JSX.Element {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  // The two glyph factories default to hope's built-ins; a preset's `defaultProps.select` swaps them
  // app-wide (and a per-`Select.Root` prop wins over that). `sideOffset: 4` is the small gap a picker
  // keeps from its control — tighter than Popover's 8, which has to clear an arrow;
  // `collisionPadding: 8` keeps the card off the viewport edge.
  const merged = useDefaults({
    recipe: "select",
    props,
    defaults: {
      size: "md" as const,
      chevronIcon: () => <ChevronDownIcon />,
      checkIcon: () => <CheckIcon />,
      sideOffset: 4,
      collisionPadding: 8,
    },
  });

  // `useSlots` returns one ready-to-call class fn per slot, each folding the override chain: recipe
  // base → preset `slotClasses` → instance `slotClasses` → the part's own `class`. `size` is the whole
  // styling axis; passing the complete variant set every call is what `CompleteVariantsOf` requires
  // (an omitted variant would silently fall back to the recipe's `defaultVariants`).
  const slots = useSlots({
    recipe: "select",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
  });

  // `createCombobox` reads only its own option keys off `merged` (items/value/selection/open/side/…)
  // — the defaulted `size`, the glyph factories and the class props ride along harmlessly. Pass
  // `merged`, not raw `props`: `useDefaults` exposes its defaults as getters over `props`, so `merged`
  // stays just as lazy and reactive (the controllable-state getters, and every positioning getter
  // `createFloating` tracks, stay live) while being the single source of truth.
  const state = createCombobox<V, M, G>(merged);

  const context: SelectContextValue = {
    // The generics cannot flow through Solid context — see `select-context.ts`.
    state: state as unknown as CreateComboboxReturn<unknown>,
    slots,
    // The consumer's array, in the shape they passed it: items when flat, group entries when
    // `groupToItems` is set. `Select.List` iterates exactly this; the kernel's own source is
    // flattened and has no group boundaries left to iterate.
    items: () => merged.items as readonly unknown[],
    // Accessors (via `runIfFunction`), so each read builds a fresh glyph element from the resolved
    // factory (instance ?? preset ?? built-in) — never a reused, movable node.
    chevronIcon: () => runIfFunction(merged.chevronIcon),
    checkIcon: () => runIfFunction(merged.checkIcon),
  };

  return (
    <SelectContext value={context}>
      {merged.children}
      {/* Native form submission, opt-in via `name`. The kernel's `HiddenSelect` renders the real
      control — a clipped `<select>` carrying every `<option>`, server-side too, so autofill has the
      whole set to match against — with `name`/`form`/`required`/`disabled`, writing an autofilled
      choice back into the selection and restoring the default on the form's `reset`. It is a sibling
      of the children, never inside the popup: the popup is portaled out of the `<form>` entirely, so
      a field in there would submit nothing. `triggerRef` is the visible control focus lands on when
      a blocked submit reports the field invalid — a clipped control cannot take that focus itself. */}
      <HiddenSelect state={state.list} triggerRef={state.triggerElement} />
    </SelectContext>
  );
}

// Re-export the recipe vocabulary so consumers can import it from the component's subpath.
export type { SelectSize };
