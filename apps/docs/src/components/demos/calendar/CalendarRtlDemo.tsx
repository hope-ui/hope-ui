import { Calendar } from "@hope-ui/components/calendar";
import { I18nProvider } from "@hope-ui/i18n";
import { REFERENCE_DATE } from "./data";

// LTR vs RTL, side by side — and the reason both channels are declared. The `dir` wrapper mirrors the
// LAYOUT (the chrome flips, Prev to the right; the grid's columns reverse); the `I18nProvider` locale
// mirrors the ARROW KEYS and supplies the Arabic month name and Arabic-Indic day numbers. hope-ui
// never writes a locale-derived `dir` for you, so it can't override a direction the page already set —
// which is also what lets these two locales sit side by side here at all, something a document-level
// `dir` could never express.
export function CalendarRtlDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <div class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">en-US (LTR)</span>
        <I18nProvider locale="en-US">
          <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />
        </I18nProvider>
      </div>

      <div dir="rtl" class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">ar-EG (RTL)</span>
        <I18nProvider locale="ar-EG">
          <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />
        </I18nProvider>
      </div>
    </div>
  );
}
