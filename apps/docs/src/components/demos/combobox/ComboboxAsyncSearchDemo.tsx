import { Combobox } from "@hope-ui/components/combobox";
import { createSignal, onCleanup } from "solid-js";
import {
  FRUITS,
  type Fruit,
  FruitControl,
  FruitItem,
  itemToLabel,
  itemToValue,
  Stage,
} from "./data";

// Live demo for "Async search". `filter={false}` turns the built-in narrowing off entirely: `items`
// is passed through untouched, so the rows on screen are exactly the ones you handed back. The search
// itself moves to `onInputValueChange`, which fires on every keystroke.
//
// The "request" here is a `setTimeout` over the same eight fruits — a real one would be `fetch` — and
// it is debounced, which is the other half of why the filter has to be off: a stale response must not
// re-narrow a list the user has already typed past.
export function ComboboxAsyncSearchDemo() {
  const [results, setResults] = createSignal<Fruit[]>(FRUITS);
  const [pending, setPending] = createSignal(false);

  let timer: ReturnType<typeof setTimeout> | undefined;
  onCleanup(() => clearTimeout(timer));

  const search = (query: string) => {
    clearTimeout(timer);
    setPending(true);
    timer = setTimeout(() => {
      setResults(
        query === ""
          ? FRUITS
          : FRUITS.filter((fruit) => fruit.name.toLowerCase().includes(query.toLowerCase())),
      );
      setPending(false);
    }, 300);
  };

  return (
    <Stage>
      <Combobox.Root
        items={results()}
        itemToValue={itemToValue}
        itemToLabel={itemToLabel}
        filter={false}
        onInputValueChange={search}
      >
        <FruitControl label="Search fruit" placeholder="Server-side…" />
        <Combobox.Portal>
          <Combobox.Positioner>
            <Combobox.Content>
              <Combobox.List>{(fruit: Fruit) => <FruitItem fruit={fruit} />}</Combobox.List>
              <Combobox.Empty>{pending() ? "Searching…" : "No fruit matches that."}</Combobox.Empty>
              <Combobox.Status />
            </Combobox.Content>
          </Combobox.Positioner>
        </Combobox.Portal>
      </Combobox.Root>

      <output class="text-foreground-muted text-sm">
        {pending() ? "fetching…" : `${results().length} result(s) from the “server”`}
      </output>
    </Stage>
  );
}
