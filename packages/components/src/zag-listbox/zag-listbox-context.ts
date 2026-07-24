import { createComponentContext } from "@hope-ui/primitives/internal";
import type { PropTypes } from "@hope-ui/primitives/zag-solid";
import type { ListboxSlot } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import type { Api, CollectionItem, ItemState } from "@zag-js/listbox";
import type { Accessor } from "solid-js";

/** `@zag-js/listbox`'s connected API, bound to the vendored adapter's Solid prop types. */
export type ZagListboxApi = Api<PropTypes>;

/**
 * The value every ZagListbox part reads. **Composition, not inheritance**, exactly as
 * `listbox-context.ts` does it — it *holds* the machine's connected API rather than spreading it.
 *
 * **No generic-through-context cast here**, unlike hope's `Listbox`. That is not a win: Zag types
 * `CollectionItem` as `any`, so the item type never has to travel through context because it was
 * erased at the collection's door. hope's cast exists precisely because it keeps `<V>`.
 */
export interface ZagListboxContextValue {
  /** The connected machine API, recomputed on every transition. Parts call `ctx.api().getXProps()`. */
  api: Accessor<ZagListboxApi>;
  /** One ready-to-call class fn per Listbox slot, resolved once on `Root` and shared here. */
  slots: Record<ListboxSlot, () => string>;
  /**
   * The resolved default selection-check glyph, flowed from `Root` exactly as hope's `Listbox` does
   * it. An accessor, so each read builds a **fresh** element — never a reused, movable node.
   */
  checkIcon: () => JSX.Element;
}

export const [ZagListboxContext, useZagListboxContext] =
  createComponentContext<ZagListboxContextValue>("ZagListbox");

/**
 * The per-item scope. `ZagListbox.Item` publishes the item it was handed plus its connected
 * `ItemState`, because `getItemTextProps` / `getItemIndicatorProps` both take `{ item }` again — the
 * machine has no per-item handle, so the item **data** is the handle, and every descendant part has
 * to be told which row it belongs to.
 */
export interface ZagListboxItemContextValue {
  /** The collection item this row renders — re-passed to every descendant part's `getXProps`. */
  item: Accessor<CollectionItem>;
  /** This row's connected state (`selected`/`highlighted`/`disabled`/`value`), recomputed per read. */
  itemState: Accessor<ItemState>;
}

export const [ZagListboxItemContext, useZagListboxItemContext] =
  createComponentContext<ZagListboxItemContextValue>("ZagListbox.Item");
