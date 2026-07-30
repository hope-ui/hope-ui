import { Button } from "@hope-ui/components/button";
import { Listbox } from "@hope-ui/components/listbox";
import { createSignal } from "solid-js";
import { FRUITS, type Fruit, FruitItem, isItemDisabled, itemToLabel, itemToValue } from "./data";

// Native form submission, opt-in via `name`: the listbox renders hidden fields (siblings of the list
// element) valued `itemToValue(item)` for each selected row, so a plain `<form>` submit carries the
// selection with no extra wiring. Submit and watch the captured `FormData` render below — the values
// are the `itemToValue` strings (the fruit ids), not the labels.
export function ListboxFormDemo() {
  const [submitted, setSubmitted] = createSignal<string[] | null>(null);
  const [value, setValue] = createSignal<Fruit[]>([FRUITS[1]]);

  return (
    <form
      class="flex flex-col items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(new FormData(event.currentTarget).getAll("fruit").map(String));
      }}
    >
      <Listbox.Root
        aria-label="Choose fruits"
        selectionMode="multiple"
        name="fruit"
        items={FRUITS}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        isItemDisabled={isItemDisabled}
        value={value()}
        onChange={setValue}
      >
        {(fruit) => <FruitItem fruit={fruit} />}
      </Listbox.Root>
      <Button type="submit" size="sm">
        Submit
      </Button>
      <output class="text-sm text-foreground-muted">
        {submitted() ? `Submitted fruit=[${submitted()?.join(", ")}]` : "Not submitted yet"}
      </output>
    </form>
  );
}
