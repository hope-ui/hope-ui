import { Calendar } from "@hope-ui/components/calendar";
import { I18nProvider } from "@hope-ui/i18n";
import { For } from "solid-js";
import { REFERENCE_DATE } from "./data";

// Locale-driven formatting with no other config. The same Gregorian month renders its heading, weekday
// names, and day numbers in the active locale — `fr-FR` (Monday-first, French month/weekday names) and
// `ja-JP` (Sunday-first, "2026年6月", Japanese weekday glyphs). Only the `locale` on the provider changes.
const LOCALES: { tag: string; label: string }[] = [
  { tag: "fr-FR", label: "Français (fr-FR)" },
  { tag: "ja-JP", label: "日本語 (ja-JP)" },
];

export function CalendarLocaleFormattingDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <For each={LOCALES}>
        {(locale) => (
          <div class="flex flex-col items-center gap-2">
            <span class="text-xs font-medium text-foreground-subtle">{locale.label}</span>
            <I18nProvider locale={locale.tag}>
              <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />
            </I18nProvider>
          </div>
        )}
      </For>
    </div>
  );
}
