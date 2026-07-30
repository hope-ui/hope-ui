import { Listbox } from "@hope-ui/components/listbox";
import type { JSX } from "@solidjs/web";

// Shared dataset + helpers for the Listbox demos. Items are objects (not bare strings) so the
// demos show the data accessors doing real work: `itemToValue` is the selection identity (and, with
// `name`, the string submitted to a form), `itemToLabel` the typeahead / display text, and
// `isItemDisabled` the per-row disabled state — all answered from the data, before a row mounts.
export interface Fruit {
  id: number;
  name: string;
  disabled?: boolean;
}

export const FRUITS: Fruit[] = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Date" },
  { id: 5, name: "Elderberry", disabled: true },
  { id: 6, name: "Fig" },
];

export const itemToValue = (fruit: Fruit) => String(fruit.id);
export const itemToLabel = (fruit: Fruit) => fruit.name;
export const isItemDisabled = (fruit: Fruit) => fruit.disabled ?? false;

// One option row: the check `ItemIndicator` (painted only while the row is selected) plus its label.
// `item` is the row's whole identity — everything else about it comes from the accessors above.
export function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Listbox.Item item={props.fruit}>
      <Listbox.ItemIndicator />
      {props.fruit.name}
    </Listbox.Item>
  );
}
