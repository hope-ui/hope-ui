import { Combobox } from "@hope-ui/components/combobox";
import { createSignal } from "solid-js";
import { FRUITS, FruitControl, FruitPopup, itemToLabel, itemToValue, Stage } from "./data";

// Live demo for "Custom values". Type something no option matches — `Tomato` — then press Tab or
// click away.
//
// With `allowsCustomValue`, the text stands on its own: it survives the commit and the selection is
// left untouched. Without it (the default), the same keystroke **reverts** the field to the current
// selection's label, which is what stops a picker showing one value while reporting another.
export function ComboboxAllowsCustomValueDemo() {
  const [text, setText] = createSignal("");
  const [strictText, setStrictText] = createSignal("");

  return (
    <Stage>
      <div class="flex flex-wrap items-start justify-center gap-6">
        <div class="flex flex-col gap-2">
          <code class="text-foreground-muted text-xs">allowsCustomValue</code>
          <Combobox.Root
            items={FRUITS}
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            allowsCustomValue
            onInputValueChange={setText}
          >
            <FruitControl label="Choose or invent a fruit" placeholder="Anything goes…" />
            <FruitPopup />
          </Combobox.Root>
          <output class="text-foreground-muted text-sm">
            text: <code>{text() || "—"}</code>
          </output>
        </div>

        <div class="flex flex-col gap-2">
          <code class="text-foreground-muted text-xs">default (reverts)</code>
          <Combobox.Root
            items={FRUITS}
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            onInputValueChange={setStrictText}
          >
            <FruitControl label="Choose a fruit" placeholder="Options only…" />
            <FruitPopup />
          </Combobox.Root>
          <output class="text-foreground-muted text-sm">
            text: <code>{strictText() || "—"}</code>
          </output>
        </div>
      </div>
    </Stage>
  );
}
