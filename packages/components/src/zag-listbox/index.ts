// The `ZagListbox` spike — a collection-driven listbox whose behavior comes from
// `@zag-js/listbox@1.42.0` through the vendored Solid 2.0 adapter (`@hope-ui/primitives/zag-solid`),
// sharing the *same* hope `listbox` recipe and importing nothing from `@hope-ui/primitives/listbox`.
//
// Unlike `zag-dialog/`, this one does **not** preserve hope's public API: Zag's collection model is
// adopted whole, because bridging it to hope's self-registering `<Listbox.Item>` children would
// manufacture the impedance layer the spike exists to measure. See
// `__internal__/spikes/zag-listbox-findings.md`.
import { Content } from "./zag-listbox-content";
import { Item } from "./zag-listbox-item";
import { ItemGroup } from "./zag-listbox-item-group";
import { ItemGroupLabel } from "./zag-listbox-item-group-label";
import { ItemIndicator } from "./zag-listbox-item-indicator";
import { ItemText } from "./zag-listbox-item-text";
import { Label } from "./zag-listbox-label";
import { Root } from "./zag-listbox-root";

export const ZagListbox = {
  Root,
  Label,
  Content,
  Item,
  ItemText,
  ItemIndicator,
  ItemGroup,
  ItemGroupLabel,
};

export type { ZagListboxContentProps } from "./zag-listbox-content";
export type { ZagListboxItemProps } from "./zag-listbox-item";
export type { ZagListboxItemGroupProps } from "./zag-listbox-item-group";
export type { ZagListboxItemGroupLabelProps } from "./zag-listbox-item-group-label";
export type { ZagListboxItemIndicatorProps } from "./zag-listbox-item-indicator";
export type { ZagListboxItemTextProps } from "./zag-listbox-item-text";
export type { ZagListboxLabelProps } from "./zag-listbox-label";
export type { ListboxSize, ZagListboxRootProps } from "./zag-listbox-root";
