// The `Combobox` compound component: a styled, themeable layer over the headless `createCombobox`
// behavior hook (the half it shares with `Select`) plus the text half that hook deliberately does not
// own — the input's value, the filter derived from it, and the commit/revert policy. Each part lives
// in its own `combobox-<part>.tsx` file and this barrel is the one place the namespace object is
// assembled.
import { Clear } from "./combobox-clear";
import { Content } from "./combobox-content";
import { Control } from "./combobox-control";
import { Empty } from "./combobox-empty";
import { Group } from "./combobox-group";
import { GroupLabel } from "./combobox-group-label";
import { Icon } from "./combobox-icon";
import { Input } from "./combobox-input";
import { Item } from "./combobox-item";
import { ItemIndicator } from "./combobox-item-indicator";
import { ItemText } from "./combobox-item-text";
import { List } from "./combobox-list";
import { Portal } from "./combobox-portal";
import { Positioner } from "./combobox-positioner";
import { Root } from "./combobox-root";
import { Separator } from "./combobox-separator";
import { Status } from "./combobox-status";
import { Trigger } from "./combobox-trigger";

export const Combobox = {
  Root,
  Control,
  Input,
  Clear,
  Trigger,
  Icon,
  Portal,
  Positioner,
  Content,
  List,
  Empty,
  Status,
  Group,
  GroupLabel,
  Separator,
  Item,
  ItemText,
  ItemIndicator,
};

export type { ComboboxClearProps } from "./combobox-clear";
export type { ComboboxContentProps } from "./combobox-content";
export type { ComboboxControlProps } from "./combobox-control";
export type { ComboboxEmptyProps } from "./combobox-empty";
export type { ComboboxFilter, ComboboxFilterFn } from "./combobox-filter";
export type { ComboboxGroupProps } from "./combobox-group";
export type { ComboboxGroupLabelProps } from "./combobox-group-label";
export type { ComboboxIconProps } from "./combobox-icon";
export type { ComboboxInputProps } from "./combobox-input";
export type { ComboboxItemProps } from "./combobox-item";
export type { ComboboxItemIndicatorProps } from "./combobox-item-indicator";
export type { ComboboxItemTextProps } from "./combobox-item-text";
export type { ComboboxListProps } from "./combobox-list";
export type { ComboboxPortalProps } from "./combobox-portal";
export type { ComboboxPositionerProps } from "./combobox-positioner";
export type { ComboboxMenuTrigger, ComboboxRootProps, ComboboxSize } from "./combobox-root";
export type { ComboboxSeparatorProps } from "./combobox-separator";
export type { ComboboxStatusProps } from "./combobox-status";
export type { ComboboxTriggerProps } from "./combobox-trigger";
