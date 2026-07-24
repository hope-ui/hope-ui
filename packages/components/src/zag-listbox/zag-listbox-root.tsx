import { renderElement } from "@hope-ui/primitives/render";
import { runIfFunction } from "@hope-ui/primitives/utils";
import { mergeProps, normalizeProps, useMachine } from "@hope-ui/primitives/zag-solid";
import type { ListboxSize, ListboxThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import {
  type CollectionItem,
  connect,
  type ElementIds,
  type HighlightChangeDetails,
  type ListCollection,
  machine as listboxMachine,
  type SelectionDetails,
  type SelectionMode,
  type ValueChangeDetails,
} from "@zag-js/listbox";
import { createMemo, createUniqueId, omit } from "solid-js";
import { CheckIcon } from "../icons";
import { ZagListboxContext, type ZagListboxContextValue } from "./zag-listbox-context";

/**
 * `ZagListboxRootProps` is **Zag's** listbox surface, not hope's. The spike deliberately does not
 * preserve `ListboxRootProps`: the repo is at `v0.0.0` with no published consumers, and building a
 * bridge from Zag's collection to hope's self-registering `<Listbox.Item>` children would manufacture
 * the very impedance layer this spike exists to measure. So the collection model is adopted whole —
 * `collection` in, `<For each={collection.items}>` out, `value`/`highlightedValue` as `string[]` /
 * `string | null` keys rather than item values — and the public-API delta is recorded as a one-time
 * migration cost in `__internal__/spikes/zag-listbox-findings.md`.
 *
 * The only hope-owned props are the themeable ones (`size`, `checkIcon`) plus the per-instance class
 * overrides, which is what lets this render through the **same** `listbox` recipe.
 */
export interface ZagListboxRootProps extends ListboxThemeableProps {
  /** The item collection, built with `collection({ items, itemToValue, itemToString, … })`. */
  collection: ListCollection<CollectionItem>;
  /** Controlled selection, as collection **keys**. */
  value?: string[];
  /** Initial selection, uncontrolled. Default `[]`. */
  defaultValue?: string[];
  /** Fires with Zag's `{ value, items }` payload — deliberately **not** unwrapped to a bare array. */
  onValueChange?: (details: ValueChangeDetails) => void;
  /** Controlled highlighted (active) key. */
  highlightedValue?: string | null;
  /** Initial highlighted key, uncontrolled. */
  defaultHighlightedValue?: string | null;
  /** Fires when the highlighted item changes. */
  onHighlightChange?: (details: HighlightChangeDetails) => void;
  /** Fires once per newly selected key. */
  onSelect?: (details: SelectionDetails) => void;
  /** `single` | `multiple` | `extended`. Note `extended` where hope has `none`. Default `single`. */
  selectionMode?: SelectionMode;
  /** Layout/keyboard axis. Default `vertical`. */
  orientation?: "horizontal" | "vertical";
  /** Disables the whole list. */
  disabled?: boolean;
  /** Whether arrow navigation wraps at the ends. Default `false`. */
  loopFocus?: boolean;
  /** Whether typing jumps to a matching item. Default `true`. */
  typeahead?: boolean;
  /** Whether clicking the selected item in `single` mode clears it. */
  deselectable?: boolean;
  /** Whether highlighting an item also selects it. */
  selectOnHighlight?: boolean;
  /** Whether to block `meta+a` select-all in a multi-select list. */
  disallowSelectAll?: boolean;
  /**
   * Machine-derived element ids. **This is the sanctioned way to give a part a custom id** — the
   * machine resolves every id through the same helpers it looks elements up with, so attribute and
   * lookup cannot diverge. Setting `id` directly on a part changes only the attribute and breaks the
   * lookup. See `G1` in `__internal__/spikes/zag-dialog-findings.md`.
   */
  ids?: ElementIds;
  /** Reading direction, forwarded to every part as `dir`. */
  dir?: "ltr" | "rtl";
  /** Per-instance class overrides, keyed by slot. Folded in after the recipe base and the preset's
   * global `slotClasses`. */
  slotClasses?: SlotClasses<"listbox">;
  /** Merged over the recipe's `root` slot — which `Content`, not this element, carries. */
  class?: string;
  children?: JSX.Element;
}

/**
 * The ZagListbox root. Starts the `@zag-js/listbox` machine through the vendored Solid 2.0 adapter,
 * connects it once into a memo, resolves the recipe variants, and shares all of it on context.
 *
 * **It renders Zag's `root` part — a wrapper element hope's `Listbox` does not have.** Zag's anatomy
 * is `root > label + content`, where `content` is the `role="listbox"` element; hope's `Listbox.Root`
 * *is* that element. The wrapper carries no recipe slot (the `listbox` recipe has none for it), so it
 * is visually inert and the recipe's `root` classes go to `Content`. One extra DOM node per listbox,
 * and one extra part in the anatomy a consumer has to write.
 */
export function Root(props: ZagListboxRootProps): JSX.Element {
  const merged = useDefaults({
    recipe: "listbox",
    props,
    defaults: {
      size: "md" as const,
      checkIcon: () => <CheckIcon />,
    },
  });

  const slots = useSlots({
    recipe: "listbox",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  // Every Zag part id is `listbox:${scope.id}:<part>`, and the id has to survive SSR → hydrate.
  const scopeId = createUniqueId();

  const service = useMachine(listboxMachine, () => ({
    id: scopeId,
    ids: merged.ids,
    dir: merged.dir,
    collection: merged.collection,
    value: merged.value,
    defaultValue: merged.defaultValue,
    onValueChange: merged.onValueChange,
    highlightedValue: merged.highlightedValue,
    defaultHighlightedValue: merged.defaultHighlightedValue,
    onHighlightChange: merged.onHighlightChange,
    onSelect: merged.onSelect,
    selectionMode: merged.selectionMode,
    orientation: merged.orientation,
    disabled: merged.disabled,
    loopFocus: merged.loopFocus,
    typeahead: merged.typeahead,
    deselectable: merged.deselectable,
    selectOnHighlight: merged.selectOnHighlight,
    disallowSelectAll: merged.disallowSelectAll,
  }));

  const api = createMemo(() => connect(service, normalizeProps));

  const context: ZagListboxContextValue = {
    api,
    slots,
    checkIcon: () => runIfFunction(merged.checkIcon),
  };

  const rest = omit(
    merged,
    "size",
    "checkIcon",
    "slotClasses",
    "class",
    "children",
    "collection",
    "value",
    "defaultValue",
    "onValueChange",
    "highlightedValue",
    "defaultHighlightedValue",
    "onHighlightChange",
    "onSelect",
    "selectionMode",
    "orientation",
    "disabled",
    "loopFocus",
    "typeahead",
    "deselectable",
    "selectOnHighlight",
    "disallowSelectAll",
    "ids",
    "dir",
  );

  const elementProps = mergeProps(
    () => api().getRootProps(),
    () => rest,
    {
      "data-slot": "zag-listbox-root",
      get children(): JSX.Element {
        return merged.children;
      },
    },
  );

  return (
    <ZagListboxContext value={context}>
      {renderElement<JSX.HTMLAttributes<HTMLElement>, HTMLElement>({
        as: "div",
        props: elementProps as unknown as JSX.HTMLAttributes<HTMLElement>,
      })}
    </ZagListboxContext>
  );
}

export type { ListboxSize };
