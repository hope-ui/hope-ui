import { Button } from "@hope-ui/components/button";
import { Combobox } from "@hope-ui/components/combobox";
import { createSignal } from "solid-js";
import {
  FRUITS,
  type Fruit,
  FruitControl,
  FruitPopup,
  itemToLabel,
  itemToValue,
  Stage,
} from "./data";

// Live demo for "Controlled value". A Combobox has **two** values, and this drives both: the
// selection (`value` + `onChange`, a scalar in single mode — the item itself, never `[item]`, with
// `null` for "nothing selected") and the text (`inputValue` + `onInputValueChange`).
//
// Watching them side by side is the point. They agree after every commit, and they disagree while
// you are mid-query — which is exactly the state `allowsCustomValue` decides the ending of: press
// Escape or Tab with unmatched text and the field reverts to the selection's label.
export function ComboboxControlledDemo() {
  const [fruit, setFruit] = createSignal<Fruit | null>(FRUITS[2]);
  const [text, setText] = createSignal(FRUITS[2].name);

  return (
    <Stage>
      <div class="flex flex-wrap items-center justify-center gap-3">
        <Combobox.Root
          items={FRUITS}
          itemToValue={itemToValue}
          itemToLabel={itemToLabel}
          value={fruit()}
          onChange={setFruit}
          inputValue={text()}
          onInputValueChange={setText}
        >
          <FruitControl label="Choose a fruit" />
          <FruitPopup />
        </Combobox.Root>

        <Button
          variant="soft"
          colorScheme="neutral"
          size="sm"
          onClick={() => {
            setFruit(null);
            setText("");
          }}
        >
          Clear
        </Button>
      </div>

      <output class="text-foreground-muted text-sm">
        selection: <code>{fruit() === null ? "null" : `"${itemToLabel(fruit() as Fruit)}"`}</code> ·
        text: <code>{`"${text()}"`}</code>
      </output>
    </Stage>
  );
}
