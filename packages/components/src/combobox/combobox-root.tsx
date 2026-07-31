import { createCollator } from "@hope-ui/i18n";
import {
  type CreateComboboxOptions,
  type CreateComboboxReturn,
  createCombobox,
  type SelectionValue,
} from "@hope-ui/primitives/combobox";
import { createTextInput, type SelectionMode } from "@hope-ui/primitives/internal";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { ComboboxSize, ComboboxThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, merge, untrack } from "solid-js";
import { CheckIcon, ChevronDownIcon, XIcon } from "../icons";
import { ComboboxContext, type ComboboxContextValue } from "./combobox-context";
import { type ComboboxFilter, resolveFilter } from "./combobox-filter";

/** When the popup opens by itself. See {@link ComboboxRootProps.menuTrigger}. */
export type ComboboxMenuTrigger = "input" | "focus" | "manual";

/** What the filter memo produces: the surviving entries, plus each group's surviving items. */
interface FilteredEntries<V, G> {
  entries: readonly G[];
  /** `undefined` when the list is flat or nothing was filtered. */
  groups: ReadonlyMap<G, readonly V[]> | undefined;
}

/**
 * `ComboboxRootProps` = the kernel's `CreateComboboxOptions` (the `items` data, the value/selection
 * surface, open state, modality, the dismissal toggles and the whole positioning surface) **plus**
 * the text half Combobox adds on top **plus** the themeable `size` axis and the three chrome glyphs
 * (`ComboboxThemeableProps`, owned by `@hope-ui/theming`).
 *
 * `<V>` is your item type, `<M>` the selection mode (inferred from `selectionMode`, which is what
 * types `value`/`defaultValue`/`onChange` as a scalar or an array), and `<G>` the shape of an `items`
 * **entry** — the same as `<V>` for a flat list, and the group's shape with `groupToItems` set.
 *
 * `Root` renders **no host element**, exactly as `Select.Root` does: no `class`, no `render`, no
 * native-attribute passthrough and **no hand-kept `omit` list**. `Popover.Root` is the precedent
 * *and* the warning — don't "fix" that by adding one.
 *
 * Three of the kernel's options are `Omit`-ted, each turning a silent breakage into a compile error:
 *
 * - **`estimateSize`/`overscan`** — virtualization. A windowed row is *recycled*, so `indexOfValue`
 *   is `-1` by construction and every row would warn and register nothing. Same reasoning as
 *   `Select.Root`; a virtualized picker is `Listbox`'s job today.
 * - **`name`/`form`/`required`** — native form submission. `Select.Root` renders a `HiddenSelect`
 *   carrying every `<option>`; a Combobox's kernel holds the **filtered** set, so the same field
 *   would drop options as the user typed and submit whatever the query happened to leave. Wiring a
 *   Combobox into a form is a `Field` concern and needs its own design.
 */
export interface ComboboxRootProps<V = unknown, M extends SelectionMode = "single", G = V>
  extends Omit<
      CreateComboboxOptions<V, M, G>,
      "estimateSize" | "overscan" | "name" | "form" | "required"
    >,
    ComboboxThemeableProps {
  /**
   * How `items` narrows as the user types. `"contains"` (default), `"startsWith"`, your own
   * `(item, query) => boolean`, or **`false`** to filter nothing — the async-search shape, where you
   * fetch on `onInputValueChange` and hand back the results yourself.
   *
   * The built-in matchers are collator-backed (`{ usage: "search", sensitivity: "base" }`), so
   * `cafe` matches `Café` and `acai` matches `Açaí`. See `combobox-filter.ts`.
   */
  filter?: ComboboxFilter<V>;
  /** Controlled text in the input. Omit for uncontrolled use via `defaultInputValue`. */
  inputValue?: string;
  /**
   * Initial text, uncontrolled. Defaults to the initially-selected item's label in single-selection
   * mode, and to `""` otherwise — a field showing "Apple" the moment `defaultValue={apple}` is set.
   */
  defaultInputValue?: string;
  /** Called on every text change: typing, each IME composition update, and every commit/revert. */
  onInputValueChange?: (value: string) => void;
  /**
   * Whether text that matches no option survives a commit. Default `false` — Enter, Tab or blur with
   * nothing highlighted **reverts** the field to the current selection's label, which is what stops a
   * picker reporting one value while showing another. Set `true` for a "search or type your own"
   * field; the text then stands alone and the selection is left untouched.
   */
  allowsCustomValue?: boolean;
  /**
   * What opens the popup on its own. `"input"` (default) — typing opens it. `"focus"` — focusing the
   * field opens it, which suits a short, browsable list. `"manual"` — only the chevron and the arrow
   * keys open it. All three leave the arrow keys and the chevron working.
   */
  menuTrigger?: ComboboxMenuTrigger;
  /**
   * Per-instance class overrides, keyed by slot. Folded in after the recipe base and the preset's
   * global `slotClasses`. Set once here to reach every part. Use literal class strings so the
   * consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"combobox">;
  children?: JSX.Element;
}

/**
 * The Combobox root. It is `Select.Root` plus a text value: the same `createCombobox` kernel (open
 * state + the eagerly-created listbox + ids + element registries + the floating layer + the shared
 * presence), and on top of it the four things the kernel deliberately does not own — the input's
 * value, the filter derived from it, the commit/revert policy, and the "show everything" state a
 * chevron-open leaves behind.
 *
 * **The filter is a derived `items` memo, and that is the whole seam.** `createCombobox` is handed
 * the surviving entries and never learns a query exists, so the option count `Combobox.Status`
 * announces, the emptiness `Combobox.Empty` shows and the set the arrow keys traverse all fall out
 * of one array. See `combobox-filter.ts`.
 *
 * **`allowsEmptyCollection` defaults to `true` here**, where the kernel defaults it to `false`. On a
 * Select an empty listbox is a dead end worth refusing to open; on a Combobox it is the normal
 * result of typing something with no matches, and closing the popup would take `Combobox.Empty` —
 * the part whose whole job is saying so — off screen with it.
 *
 * **`modal` defaults to `false`**, where the kernel defaults it to `true`. `createHideOutside` marks
 * the rest of the page `inert`, which is right for a Select the user has committed to and wrong for
 * a search field they are still typing into.
 *
 * **The input needs an accessible name.** Combobox ships no `Label` part (labelling is a future
 * `Field`'s job), so an `aria-label` — or an `aria-labelledby` pointing at the consumer's own
 * `<label>` — on `Combobox.Input` is mandatory: a nameless `role="combobox"` is an axe
 * `aria-input-field-name` violation, and so is the `role="listbox"` that inherits its name.
 *
 * Because it reads a recipe, a `Combobox.Root` **requires a `<ThemeProvider>`** ancestor fed a
 * preset, like every other styled component.
 */
export function Root<V = unknown, M extends SelectionMode = "single", G = V>(
  props: ComboboxRootProps<V, M, G>,
): JSX.Element {
  const merged = useDefaults({
    recipe: "combobox",
    props,
    defaults: {
      size: "md" as const,
      chevronIcon: () => <ChevronDownIcon />,
      checkIcon: () => <CheckIcon />,
      clearIcon: () => <XIcon />,
      filter: "contains" as ComboboxFilter<V>,
      menuTrigger: "input" as ComboboxMenuTrigger,
      allowsCustomValue: false,
      // Both flipped from the kernel's own defaults — see this component's doc.
      allowsEmptyCollection: true,
      modal: false,
      sideOffset: 4,
      collisionPadding: 8,
    },
  });

  const slots = useSlots({
    recipe: "combobox",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
  });

  const selectionMode = (): SelectionMode => merged.selectionMode ?? "single";
  const itemToValue = (item: V): string => merged.itemToValue?.(item) ?? String(item);
  const itemToLabel = (item: V): string => merged.itemToLabel?.(item) ?? itemToValue(item);

  /**
   * The text a selection displays. Only single-selection mode puts a value in the field: with
   * several picked there is no one label to show, so the input stays the query and is emptied after
   * each pick — the shape every multi-select combobox takes, with the ticks in the list doing the
   * reporting.
   */
  const textForSelection = (selection: SelectionValue<V, M> | undefined): string => {
    if (selectionMode() !== "single") {
      return "";
    }
    const item = selection as V | null | undefined;
    return item == null ? "" : itemToLabel(item);
  };

  const textInput = createTextInput<HTMLInputElement>({
    value: () => merged.inputValue,
    // Read once, when the internal signal is created — so this resolves the *initial* selection off
    // the props rather than off the kernel, which does not exist yet.
    defaultValue: () =>
      merged.defaultInputValue ??
      textForSelection((merged.value ?? merged.defaultValue) as SelectionValue<V, M> | undefined),
    onChange: (value) => merged.onInputValueChange?.(value),
  });

  /**
   * Whether the popup is showing every option rather than the query's matches. It is what makes the
   * chevron work on a committed field: with "Apple" in the input, filtering by it would leave a
   * one-row list, so a pointer open (and every close) resets to the full set and only typing narrows
   * it. React Aria calls the same state `showAllItems`.
   */
  const [showAllItems, setShowAllItems] = createSignal(true);

  const collator = createCollator({ usage: "search", sensitivity: "base" });

  /**
   * The query the filter runs on, **held while an IME composition is in progress**. A half-typed CJK
   * word matches nothing, so filtering on it would empty the list and flash `Combobox.Empty` on
   * every keystroke of a multi-key character. `createTextInput` exposes `isComposing()` precisely so
   * this decision can be made here — it is a Combobox policy, not a text-input one, and Base UI
   * makes the same call one layer down. `compositionend` writes the final text and the filter runs
   * once.
   */
  const query = createMemo<string>((previous) =>
    textInput.isComposing() ? (previous ?? "") : textInput.value(),
  );

  const filtered = createMemo<FilteredEntries<V, G>>(() => {
    const entries = merged.items as readonly G[];
    const filter = merged.filter;
    const text = query();
    // `filter === false` keeps the consumer's array **identity**, which is what an async search
    // needs: nothing downstream re-derives, and the results they fetched are the results shown.
    if (filter === false || showAllItems() || text === "") {
      return { entries, groups: undefined };
    }

    const predicate = resolveFilter<V>(filter, collator(), itemToLabel);
    const groupToItems = merged.groupToItems;
    if (groupToItems === undefined) {
      return {
        entries: (entries as readonly unknown[] as readonly V[]).filter((item) =>
          predicate(item, text),
        ) as readonly unknown[] as readonly G[],
        groups: undefined,
      };
    }

    // Grouped: filter *within* each group and drop the ones left empty, so a heading never survives
    // its last row. The surviving sublists are carried out of here because both the kernel (which
    // flattens them into navigation order) and the consumer's own inner `<For>` need them.
    const groups = new Map<G, readonly V[]>();
    const kept: G[] = [];
    for (const group of entries) {
      const surviving = groupToItems(group).filter((item) => predicate(item, text));
      if (surviving.length > 0) {
        groups.set(group, surviving);
        kept.push(group);
      }
    }
    return { entries: kept, groups };
  });

  const itemsOfGroup = (entry: unknown): readonly unknown[] => {
    const { groups } = filtered();
    return groups?.get(entry as G) ?? merged.groupToItems?.(entry as G) ?? [];
  };

  const state = createCombobox<V, M, G>(
    merge(merged, {
      get items() {
        return filtered().entries;
      },
      get groupToItems() {
        const original = merged.groupToItems;
        // Wrapped, never forwarded raw: the kernel flattens groups into navigation order, and the
        // original accessor would hand it every row the filter just removed.
        return original === undefined
          ? undefined
          : (group: G) => itemsOfGroup(group) as readonly V[];
      },
      onChange: (value: SelectionValue<V, M>) => {
        // The field's text follows the selection — every path that selects lands here, because the
        // kernel routes Enter, Space and an option's own click through one `onChange`.
        textInput.setValue(textForSelection(value));
        setShowAllItems(true);
        merged.onChange?.(value);
      },
    }),
  );

  const revert = () => {
    textInput.setValue(textForSelection(state.value()));
    setShowAllItems(true);
  };

  const commit = () => {
    // Idempotent by construction: Tab commits and the blur that follows commits again, and both
    // land on the same branch. Selecting goes through the kernel's wrapped `onChange`, so the text,
    // the close-on-select and `showAllItems` are all handled there rather than repeated here.
    if (state.list.focus.activeItem() !== undefined) {
      state.list.selection.selectActive();
      return;
    }
    if (merged.allowsCustomValue) {
      return;
    }
    revert();
  };

  const onUserInput = () => {
    setShowAllItems(false);
    if (merged.menuTrigger === "input") {
      // "first", so the top suggestion is highlighted and Enter commits it — what a search field is
      // expected to do. The signal only changes on the first keystroke of a session, so the entry
      // effect does not re-run per character.
      state.setFocusStrategy("first");
      state.setOpen(true);
    }
  };

  const onUserFocus = () => {
    if (merged.menuTrigger === "focus") {
      state.setFocusStrategy("selected");
      state.setOpen(true);
    }
  };

  // Re-anchor the highlight whenever the filter changes the option set while the popup is open. The
  // active index points into the *previous* array, so leaving it alone highlights an unrelated row —
  // or, once the list is shorter than the index, nothing at all, silently dropping
  // `aria-activedescendant` while the popup still looks navigable. Identity-keyed, so the unfiltered
  // passes (which return the consumer's own array) never trigger it.
  createEffect(
    () => filtered().entries,
    () =>
      untrack(() => {
        if (state.open()) {
          state.list.navigation.first();
        }
      }),
  );

  const context: ComboboxContextValue = {
    // The generics cannot flow through Solid context — see `combobox-context.ts`.
    state: state as unknown as CreateComboboxReturn<unknown>,
    slots,
    textInput,
    commit,
    revert,
    onUserInput,
    onUserFocus,
    items: () => filtered().entries as readonly unknown[],
    itemsOfGroup,
    isEmpty: () => filtered().entries.length === 0,
    // Accessors (via `runIfFunction`), so each read builds a fresh glyph element from the resolved
    // factory (instance ?? preset ?? built-in) — never a reused, movable node.
    chevronIcon: () => runIfFunction(merged.chevronIcon),
    checkIcon: () => runIfFunction(merged.checkIcon),
    clearIcon: () => runIfFunction(merged.clearIcon),
  };

  return <ComboboxContext value={context}>{merged.children}</ComboboxContext>;
}

// Re-export the recipe vocabulary so consumers can import it from the component's subpath.
export type { ComboboxSize };
