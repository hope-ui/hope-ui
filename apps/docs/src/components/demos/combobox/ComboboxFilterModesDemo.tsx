import { Combobox } from "@hope-ui/components/combobox";
import { For } from "solid-js";
import { FRUITS, type Fruit, FruitControl, FruitPopup, itemToLabel, itemToValue } from "./data";

// Live demo for "Filtering". The same eight fruits behind three different `filter` props, side by
// side — type the same query into each and watch them disagree:
//
// - `contains` (the default) matches anywhere in the label, so `err` finds Cherry and Elderberry.
// - `startsWith` matches the prefix only, so `err` finds nothing and `b` finds Banana alone.
// - a predicate is your own function over the raw item, so it can read fields the label never shows
//   — here the id, which makes `7` find Açaí.
//
// The two built-ins are collator-backed; a predicate of your own is not, which is why this one folds
// nothing and matches on a number instead of pretending to.
const FILTERS = [
  { label: 'filter="contains"', hint: "Try “err”…", filter: "contains" as const },
  { label: 'filter="startsWith"', hint: "Try “b”…", filter: "startsWith" as const },
  {
    label: "filter={(fruit, query) => …}",
    hint: "Try “7”…",
    filter: (fruit: Fruit, query: string) =>
      String(fruit.id) === query || fruit.name.toLowerCase().startsWith(query.toLowerCase()),
  },
];

export function ComboboxFilterModesDemo() {
  return (
    <div class="flex flex-col items-start justify-center gap-6">
      <For each={FILTERS}>
        {(mode) => (
          <div class="flex flex-col gap-2">
            <code class="text-foreground-muted text-xs">{mode.label}</code>
            <Combobox.Root
              items={FRUITS}
              itemToValue={itemToValue}
              itemToLabel={itemToLabel}
              filter={mode.filter}
            >
              <FruitControl label={`Choose a fruit (${mode.label})`} placeholder={mode.hint} />
              <FruitPopup />
            </Combobox.Root>
          </div>
        )}
      </For>
    </div>
  );
}
