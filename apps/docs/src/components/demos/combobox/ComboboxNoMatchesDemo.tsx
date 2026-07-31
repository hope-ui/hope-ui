import { Combobox } from "@hope-ui/components/combobox";
import { FRUITS, type Fruit, FruitControl, FruitItem, itemToLabel, itemToValue } from "./data";

// Live demo for "Nothing matched". Type `zzz`: the popup stays **open** on `Combobox.Empty` instead
// of closing, which is why `Combobox.Root` flips the kernel's `allowsEmptyCollection` default to
// `true`. A closed popup would take the part whose whole job is saying "no matches" off screen with
// it, leaving the user staring at a field that simply stopped responding.
//
// `Empty` and `Status` are written out here rather than shared, because their placement is the point:
// both live in the card **beside** `Combobox.List`, never inside it — a `role="listbox"` may only
// contain options and groups, so a message in there would be counted as one.
export function ComboboxNoMatchesDemo() {
  return (
    <Combobox.Root items={FRUITS} itemToValue={itemToValue} itemToLabel={itemToLabel}>
      <FruitControl label="Choose a fruit" placeholder="Try “zzz”…" />
      <Combobox.Portal>
        <Combobox.Positioner>
          <Combobox.Content>
            <Combobox.List>{(fruit: Fruit) => <FruitItem fruit={fruit} />}</Combobox.List>
            <Combobox.Empty>No fruit matches that.</Combobox.Empty>
            <Combobox.Status />
          </Combobox.Content>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}
