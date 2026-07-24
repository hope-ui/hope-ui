import { Listbox } from "@hope-ui/components/listbox";
import type { JSX } from "@solidjs/web";

// Shared dataset + helpers for the Listbox demos. Items are objects (not bare strings) so the
// demos show `itemToValue` / `itemToLabel` doing real work: `itemToValue` is the selection identity
// (and, with `name`, the string submitted to a form), `itemToLabel` the typeahead / display text.
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

// One option row: the check `ItemIndicator` (painted only while the row is selected) plus its label.
export function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Listbox.Item value={props.fruit} disabled={props.fruit.disabled}>
      <Listbox.ItemIndicator />
      {props.fruit.name}
    </Listbox.Item>
  );
}
