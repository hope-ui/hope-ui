import { Combobox } from "@hope-ui/components/combobox";
import { For } from "solid-js";
import { FRUITS, FruitControl, FruitPopup, itemToLabel, itemToValue, Stage } from "./data";

// Live demo for "What opens the popup". `menuTrigger` decides what opens it *on its own* — and only
// that. The chevron and the arrow keys open all three, always, which is what keeps `"manual"` usable
// with a keyboard.
//
// - `"input"` (the default) opens on the first keystroke: a search field.
// - `"focus"` opens the moment the field is focused: a short list worth browsing.
// - `"manual"` waits for the chevron or an arrow key: a field whose text matters more than its list.
const TRIGGERS = ["input", "focus", "manual"] as const;

export function ComboboxMenuTriggerDemo() {
  return (
    <Stage>
      <div class="flex flex-wrap items-start justify-center gap-6">
        <For each={TRIGGERS}>
          {(trigger) => (
            <div class="flex flex-col gap-2">
              <code class="text-foreground-muted text-xs">menuTrigger="{trigger}"</code>
              <Combobox.Root
                items={FRUITS}
                itemToValue={itemToValue}
                itemToLabel={itemToLabel}
                menuTrigger={trigger}
              >
                <FruitControl label={`Choose a fruit (${trigger})`} placeholder={trigger} />
                <FruitPopup />
              </Combobox.Root>
            </div>
          )}
        </For>
      </div>
    </Stage>
  );
}
