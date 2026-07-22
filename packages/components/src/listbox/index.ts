// The `Listbox` compound component — a styled, themeable layer over the `createListbox` primitive
// hook family. Each part lives in its own `listbox-<part>.tsx` file (a shared `listbox-context.ts`
// carries the three contexts that distribute the recipe slot fns + the group/item scopes); this
// barrel is the one place the namespace object is assembled — the component's single subpath export.
// Mirrors `src/dialog/`.
import { Group } from "./listbox-group";
import { GroupLabel } from "./listbox-group-label";
import { Item } from "./listbox-item";
import { ItemIndicator } from "./listbox-item-indicator";
import { Root } from "./listbox-root";
import { Separator } from "./listbox-separator";

export const Listbox = {
  Root,
  Item,
  ItemIndicator,
  Group,
  GroupLabel,
  Separator,
};

export type { ListboxGroupProps } from "./listbox-group";
export type { ListboxGroupLabelProps } from "./listbox-group-label";
export type { ListboxItemProps } from "./listbox-item";
export type { ListboxItemIndicatorProps } from "./listbox-item-indicator";
export type { ListboxRootProps, ListboxSize } from "./listbox-root";
export type { ListboxSeparatorProps } from "./listbox-separator";
