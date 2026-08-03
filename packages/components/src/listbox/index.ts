// The `Listbox` compound component — a styled, themeable layer over the headless `createListbox`
// hook family in `@hope-ui/primitives`. This barrel is the one place the namespace object is
// assembled, and the component's single published entry point.
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
