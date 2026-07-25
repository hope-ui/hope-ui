import { Calendar } from "@hope-ui/components/calendar";
import { I18nProvider } from "@hope-ui/i18n";
import { REFERENCE_DATE } from "./data";

// LTR vs RTL, side by side. The locale is the only thing configured: `<I18nProvider locale="ar-EG">`
// gives the calendar its reading direction, and `Calendar.Root` writes the resolved direction onto its
// own element — so the chrome mirrors (Prev to the right, Next to the left), arrow-key navigation
// flips, and the Arabic-Indic day numbers come from the locale's numbering system. No `dir` prop and
// no wrapper: the two locales can therefore sit side by side on one page without either leaking.
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
          <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />
        </I18nProvider>
      </div>
    </div>
  );
}
