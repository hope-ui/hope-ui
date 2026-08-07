import { Select } from "@hope-ui/components/select";
import { FRUITS, type Fruit, FruitItem, itemToLabel, itemToValue } from "./data";

// Live demo for "Polymorphism": the trigger rendered as the consumer's own pill-shaped button. Every
// computed prop rides through the spread — the `role="combobox"`, the popup ARIA, the whole keymap —
// so the control still opens on ArrowDown, still runs typeahead while closed, and still anchors the
// popup, which is the internal ref surviving the swap. `class` is set *after* the spread on purpose:
// that is what replaces the recipe's `trigger` chrome with this one's instead of merging into it.
export function SelectPolymorphicDemo() {
  return (
    <Select.Root
      items={FRUITS}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      defaultValue={FRUITS[5]}
    >
      <Select.Trigger
        aria-label="Choose a fruit"
        render={(props) => (
          <button
            {...props}
            class="inline-flex min-w-44 items-center justify-between gap-3 rounded-full border border-strong bg-surface-muted px-4 py-1.5 text-foreground text-sm"
          />
        )}
      >
        <Select.Value placeholder="Pick a fruit" />
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Content>
            <Select.List>{(fruit: Fruit) => <FruitItem fruit={fruit} />}</Select.List>
          </Select.Content>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
