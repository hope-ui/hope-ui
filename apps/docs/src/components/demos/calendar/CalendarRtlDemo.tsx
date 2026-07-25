import { Calendar } from "@hope-ui/components/calendar";
import { I18nProvider } from "@hope-ui/i18n";
import { REFERENCE_DATE } from "./data";

// LTR vs RTL, side by side. `<I18nProvider locale="ar-EG">` drives the reading direction: arrow-key
// navigation flips and the Arabic-Indic day numbers come for free from the locale's numbering system.
//
// `dir="rtl"` is passed to `Calendar.Root` itself rather than to a wrapper, because a provider renders
// no DOM — something has to carry the direction to the browser for the chrome to mirror (Prev to the
// right, Next to the left). In a real app that is `dir` on the document root, set once; here the two
// locales sit side by side on one page, so only this column may flip.
export function CalendarRtlDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <div class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">en-US (LTR)</span>
        <I18nProvider locale="en-US">
          <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />
        </I18nProvider>
      </div>

      <div class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">ar-EG (RTL)</span>
        <I18nProvider locale="ar-EG">
          <Calendar.Root dir="rtl" defaultFocusedValue={REFERENCE_DATE} />
        </I18nProvider>
      </div>
    </div>
  );
}
