import { Button } from "@hope-ui/components/button";
import { Select } from "@hope-ui/components/select";
import { createSignal } from "solid-js";
import { FRUIT_NAMES } from "./data";

// Live demo for "Controlled value": `value` + `onChange` in the consumer's own signal. The value is a
// **scalar** in single mode — a single Select hands back the item itself, never `[item]`, and `null`
// is how "nothing selected" is spelled. That is what lets the button beside it clear the selection
// and the readout below stay honest.
export function SelectControlledDemo() {
  const [fruit, setFruit] = createSignal<string | null>("Cherry");

  return (
    <div class="not-prose flex flex-wrap items-center justify-center gap-3">
      <Select.Root items={FRUIT_NAMES} value={fruit()} onChange={setFruit}>
        <Select.Trigger aria-label="Choose a fruit">
          <Select.Value placeholder="Pick a fruit" />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Content>
              <Select.List>
                {(fruit: string) => (
                  <Select.Item item={fruit}>
                    <Select.ItemText>{fruit}</Select.ItemText>
                    <Select.ItemIndicator />
                  </Select.Item>
                )}
              </Select.List>
            </Select.Content>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>

      <Button variant="soft" colorScheme="neutral" size="sm" onClick={() => setFruit(null)}>
        Clear
      </Button>

      <output class="text-sm text-foreground-muted">
        value: <code>{fruit() === null ? "null" : `"${fruit()}"`}</code>
      </output>
    </div>
  );
}
