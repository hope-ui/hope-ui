import { Select } from "@hope-ui/components/select";
import { FRUIT_NAMES } from "./data";

// The canonical Select for the "Usage" section, and the smallest one that exists: an array of
// strings, a placeholder, and the fixed Trigger → Portal → Positioner → Content → List spine.
// Uncontrolled — the trigger owns the open state, and Escape / an outside click / picking a row all
// close it. The trigger is named with `aria-label`: Select ships no `Label` part, and a nameless
// `role="combobox"` is an accessibility violation.
export function SelectBasicDemo() {
  return (
    <Select.Root items={FRUIT_NAMES}>
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
  );
}
