import { Select } from "@hope-ui/components/select";
import type { JSX } from "@solidjs/web";

// Shared fixtures for the Select demos. Two datasets, because Select's data surface has two honest
// shapes: bare strings (nothing to configure — `itemToValue` defaults to `String`, and `itemToLabel`
// to `itemToValue`), and the consumer's own objects, where every question the widget asks about an
// item is an accessor rather than a required key name.

/** The zero-configuration shape: the item *is* its value, its label, and its typeahead text. */
export const FRUIT_NAMES = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig"];

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
  // Accented on purpose: typing its plain-ASCII prefix ("acai") exercises the collator-backed
  // typeahead, which a `toLowerCase().startsWith()` match could never find.
  { id: 7, name: "Açaí" },
];

export const itemToValue = (fruit: Fruit) => String(fruit.id);
export const itemToLabel = (fruit: Fruit) => fruit.name;
export const isItemDisabled = (fruit: Fruit) => fruit.disabled ?? false;

// One option row: the label in a truncating `ItemText`, plus the check `ItemIndicator` painted only
// while the row is selected. `item` is the row's whole identity — everything else about it (its
// value, its label, whether it is disabled) comes from the accessors above, read from the data.
//
// Sharing it across the demos also keeps each one about the thing it demonstrates rather than about
// row markup.
export function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Select.Item item={props.fruit}>
      <Select.ItemText>{props.fruit.name}</Select.ItemText>
      <Select.ItemIndicator />
    </Select.Item>
  );
}
