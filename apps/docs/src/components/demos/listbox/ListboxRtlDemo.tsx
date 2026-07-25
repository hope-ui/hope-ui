import { Listbox } from "@hope-ui/components/listbox";
import { I18nProvider } from "@hope-ui/i18n";
import { createSignal, For } from "solid-js";
import { FRUITS, type Fruit, FruitItem, itemToLabel, itemToValue } from "./data";

// The same fruits, named in Arabic, so the RTL column reads as an RTL surface rather than as English
// text in a mirrored box.
const FRUITS_AR: Fruit[] = [
  { id: 1, name: "تفاح" },
  { id: 2, name: "موز" },
  { id: 3, name: "كرز" },
  { id: 4, name: "تمر" },
  { id: 5, name: "بيلسان", disabled: true },
  { id: 6, name: "تين" },
];

// LTR vs RTL, side by side — and the reason both channels are declared. The `dir` wrapper mirrors the
// LAYOUT (the check gutter moves to the left edge, via the recipe's logical `ps-`/`pe-`/`end-`
// utilities); the `I18nProvider` locale supplies the ARROW KEYS for a horizontal list. hope-ui never
// writes a locale-derived `dir` for you, so it can't override a direction the page already set — which
// is also what lets these two locales sit side by side here at all.
export function ListboxRtlDemo() {
  const [ltrValue, setLtrValue] = createSignal<Fruit[]>([FRUITS[2]]);
  const [rtlValue, setRtlValue] = createSignal<Fruit[]>([FRUITS_AR[2]]);

  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <div class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">en-US (LTR)</span>
        <I18nProvider locale="en-US">
          <Listbox.Root
            aria-label="Choose a fruit"
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            value={ltrValue()}
            onChange={setLtrValue}
            class="w-44"
          >
            <For each={FRUITS}>{(fruit) => <FruitItem fruit={fruit} />}</For>
          </Listbox.Root>
        </I18nProvider>
      </div>

      <div dir="rtl" class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">ar-EG (RTL)</span>
        <I18nProvider locale="ar-EG">
          <Listbox.Root
            aria-label="اختر فاكهة"
            itemToValue={itemToValue}
            itemToLabel={itemToLabel}
            value={rtlValue()}
            onChange={setRtlValue}
            class="w-44"
          >
            <For each={FRUITS_AR}>{(fruit) => <FruitItem fruit={fruit} />}</For>
          </Listbox.Root>
        </I18nProvider>
      </div>
    </div>
  );
}
