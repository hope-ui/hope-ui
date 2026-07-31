// The `Select` compound component — a styled, themeable layer over the `createCombobox` kernel (the
// half it shares with the future `Combobox`) plus `createListboxItem`/`Group`/`GroupLabel`/`Separator`
// reused unchanged. Each part lives in its own `select-<part>.tsx` file (a shared `select-context.ts`
// carries the three contexts that distribute the kernel state, the recipe slot fns and the two default
// glyphs); this barrel is the one place the namespace object is assembled — the component's single
// subpath export. Mirrors `src/dialog/` and `src/popover/`.
import { Content } from "./select-content";
import { Group } from "./select-group";
import { GroupLabel } from "./select-group-label";
import { Icon } from "./select-icon";
import { Item } from "./select-item";
import { ItemIndicator } from "./select-item-indicator";
import { ItemText } from "./select-item-text";
import { List } from "./select-list";
import { Portal } from "./select-portal";
import { Positioner } from "./select-positioner";
import { Root } from "./select-root";
import { Separator } from "./select-separator";
import { Trigger } from "./select-trigger";
import { Value } from "./select-value";

export const Select = {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Positioner,
  Content,
  List,
  Group,
  GroupLabel,
  Separator,
  Item,
  ItemText,
  ItemIndicator,
};

export type { SelectContentProps } from "./select-content";
export type { SelectGroupProps } from "./select-group";
export type { SelectGroupLabelProps } from "./select-group-label";
export type { SelectIconProps } from "./select-icon";
export type { SelectItemProps } from "./select-item";
export type { SelectItemIndicatorProps } from "./select-item-indicator";
export type { SelectItemTextProps } from "./select-item-text";
export type { SelectListProps } from "./select-list";
export type { SelectPortalProps } from "./select-portal";
export type { SelectPositionerProps } from "./select-positioner";
export type { SelectRootProps, SelectSize } from "./select-root";
export type { SelectSeparatorProps } from "./select-separator";
export type { SelectTriggerProps } from "./select-trigger";
export type { SelectValueProps } from "./select-value";
