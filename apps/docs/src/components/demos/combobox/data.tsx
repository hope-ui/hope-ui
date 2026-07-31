import { Combobox } from "@hope-ui/components/combobox";
import type { JSX } from "@solidjs/web";

// Shared fixtures for the Combobox demos. The dataset is deliberately accented: `Açaí` and `Café au
// lait` are what make the folding claim demonstrable rather than asserted — typing their
// plain-ASCII spelling (`acai`, `cafe`) matches them, which `toLowerCase().includes()` never would.

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
  { id: 7, name: "Açaí" },
  { id: 8, name: "Café au lait" },
];

export const itemToValue = (fruit: Fruit) => String(fruit.id);
export const itemToLabel = (fruit: Fruit) => fruit.name;
export const isItemDisabled = (fruit: Fruit) => fruit.disabled ?? false;

export interface Basket {
  kind: string;
  fruits: Fruit[];
}

export const BASKETS: Basket[] = [
  {
    kind: "Citrus",
    fruits: [
      { id: 11, name: "Orange" },
      { id: 12, name: "Lemon" },
      { id: 13, name: "Grapefruit" },
    ],
  },
  {
    kind: "Berries",
    fruits: [
      { id: 21, name: "Strawberry" },
      { id: 22, name: "Blueberry" },
      { id: 23, name: "Raspberry" },
    ],
  },
];

// Enough room under the control for the popup to land without flipping, so a demo shows the shape it
// is meant to show. The docs' `<Preview>` panel is only 10rem tall on its own.
export function Stage(props: { children: JSX.Element }): JSX.Element {
  return (
    <div class="not-prose flex min-h-72 w-full flex-col items-center gap-3 pt-2">
      {props.children}
    </div>
  );
}

// One option row: the label in a truncating `ItemText`, plus the check `ItemIndicator` painted only
// while the row is selected. `item` is the row's whole identity — its value, its label and whether it
// is disabled all come from `Combobox.Root`'s accessors, read from the data.
//
// Sharing it across the demos keeps each one about the thing it demonstrates rather than about row
// markup.
export function FruitItem(props: { fruit: Fruit }): JSX.Element {
  return (
    <Combobox.Item item={props.fruit}>
      <Combobox.ItemText>{props.fruit.name}</Combobox.ItemText>
      <Combobox.ItemIndicator />
    </Combobox.Item>
  );
}

// The control every demo repeats: the shell, the input that owns focus, the clear button, and the
// chevron. `aria-label` is mandatory — Combobox ships no `Label` part, and a nameless
// `role="combobox"` is an accessibility violation that the popup inherits.
export function FruitControl(props: { label: string; placeholder?: string }): JSX.Element {
  return (
    <Combobox.Control>
      <Combobox.Input aria-label={props.label} placeholder={props.placeholder ?? "Search fruit…"} />
      <Combobox.Clear />
      <Combobox.Trigger>
        <Combobox.Icon />
      </Combobox.Trigger>
    </Combobox.Control>
  );
}

// The popup spine, flat: `Empty` and `Status` sit in the card **beside** `List`, never inside it — a
// `role="listbox"` may only contain options and groups.
export function FruitPopup(): JSX.Element {
  return (
    <Combobox.Portal>
      <Combobox.Positioner>
        <Combobox.Content>
          <Combobox.List>{(fruit: Fruit) => <FruitItem fruit={fruit} />}</Combobox.List>
          <Combobox.Empty>No fruit matches that.</Combobox.Empty>
          <Combobox.Status />
        </Combobox.Content>
      </Combobox.Positioner>
    </Combobox.Portal>
  );
}
