import { Listbox } from "@hope-ui/components/listbox";
import { For } from "solid-js";
import { FRUITS, FruitItem, itemToLabel, itemToValue, PANEL } from "./data";

// Both focus modes side by side. **Roving** (default) moves real DOM focus onto the active option
// and makes it the single tab stop. **Activedescendant** keeps DOM focus on the listbox container
// and points `aria-activedescendant` at the active option — the model a future Select needs, where
// focus stays on the trigger/input. Tab into each and arrow through it.
export function ListboxFocusModesDemo() {
  return (
    <>
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-foreground-muted">roving</span>
        <Listbox.Root
          aria-label="Roving listbox"
          class={PANEL}
          focusMode="roving"
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          <For each={FRUITS.slice(0, 4)}>{(fruit) => <FruitItem fruit={fruit} />}</For>
        </Listbox.Root>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-foreground-muted">activedescendant</span>
        <Listbox.Root
          aria-label="Activedescendant listbox"
          class={PANEL}
          focusMode="activedescendant"
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
        >
          <For each={FRUITS.slice(0, 4)}>{(fruit) => <FruitItem fruit={fruit} />}</For>
        </Listbox.Root>
      </div>
    </>
  );
}
