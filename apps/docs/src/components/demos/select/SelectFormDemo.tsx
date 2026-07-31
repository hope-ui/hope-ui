import { Button } from "@hope-ui/components/button";
import { Select } from "@hope-ui/components/select";
import { createSignal } from "solid-js";
import { FRUITS, type Fruit, FruitItem, isItemDisabled, itemToLabel, itemToValue } from "./data";

// Live demo for "Native form submission". `name` renders a real, clipped `<select>` carrying every
// option, so a plain `<form>` submit carries the choice with no extra wiring — the submitted string
// is `itemToValue(fruit)` (the fruit's id), not its label. Because the field is a genuine `<select>`,
// `required` really does block an empty submit (press Submit without picking anything to see the
// browser's own validation bubble, with focus moved to the trigger), and Reset puts the selection
// back where it started.
export function SelectFormDemo() {
  const [submitted, setSubmitted] = createSignal<string | null>(null);

  return (
    <form
      class="flex flex-wrap items-center justify-center gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get("fruit") ?? ""));
      }}
      onReset={() => setSubmitted(null)}
    >
      <Select.Root
        name="fruit"
        required
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={isItemDisabled}
      >
        <Select.Trigger aria-label="Choose a fruit">
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

      <Button type="submit" size="sm">
        Submit
      </Button>
      <Button type="reset" size="sm" variant="soft" colorScheme="neutral">
        Reset
      </Button>

      <output class="text-sm text-foreground-muted">
        {submitted() ? `Submitted fruit=${submitted()}` : "Not submitted yet"}
      </output>
    </form>
  );
}
