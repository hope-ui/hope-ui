import { Combobox } from "@hope-ui/components/combobox";
import {
  FRUITS,
  FruitControl,
  FruitPopup,
  isItemDisabled,
  itemToLabel,
  itemToValue,
  Stage,
} from "./data";

// The canonical Combobox for the "Usage" section: the Control shell around the input, and the fixed
// Portal → Positioner → Content spine holding the List. Uncontrolled — typing opens the popup and
// narrows the rows, Enter or a click commits, Escape puts the last committed label back.
//
// Elderberry is disabled in the data, so it is dimmed and the arrows skip it. Try `cafe` or `acai`:
// the filter is collator-backed, so it folds diacritics as well as case.
export function ComboboxBasicDemo() {
  return (
    <Stage>
      <Combobox.Root
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={isItemDisabled}
      >
        <FruitControl label="Choose a fruit" />
        <FruitPopup />
      </Combobox.Root>
    </Stage>
  );
}
