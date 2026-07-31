import { Combobox } from "@hope-ui/components/combobox";
import { FRUITS, FruitControl, FruitPopup, isItemDisabled, itemToLabel, itemToValue } from "./data";

// Live demo for "Disabled". Two different things wear the same word, and the pair is here so the
// difference is visible:
//
// - `disabled` on `Combobox.Root` turns the **whole control** off: the shell dims, the input takes no
//   text and no focus, and nothing opens.
// - `isItemDisabled` turns **one row** off: Elderberry stays in the list, keeps `aria-disabled` so a
//   screen reader still finds it, and is skipped by the arrows. It can never be selected.
export function ComboboxDisabledDemo() {
  return (
    <div class="flex flex-col items-start justify-center gap-6">
      <div class="flex flex-col gap-2">
        <code class="text-foreground-muted text-xs">disabled</code>
        <Combobox.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          defaultValue={FRUITS[0]}
          disabled
        >
          <FruitControl label="Choose a fruit (disabled)" />
          <FruitPopup />
        </Combobox.Root>
      </div>

      <div class="flex flex-col gap-2">
        <code class="text-foreground-muted text-xs">isItemDisabled</code>
        <Combobox.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          isItemDisabled={isItemDisabled}
        >
          <FruitControl label="Choose a fruit" placeholder="Try “elder”…" />
          <FruitPopup />
        </Combobox.Root>
      </div>
    </div>
  );
}
