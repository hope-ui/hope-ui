import { Calendar } from "@hope-ui/components/calendar";
import { I18nProvider } from "@hope-ui/i18n";
import { REFERENCE_DATE } from "./data";

// LTR vs RTL, side by side. Wrapping a subtree in `<I18nProvider locale="ar-EG">` gives the calendar an
// RTL reading direction: the chrome mirrors (Prev moves to the right, Next to the left), arrow-key
// navigation flips, and the Arabic-Indic day numbers come for free from the locale's numbering system.
// The `dir="rtl"` on the RTL column is what mirrors the CSS layout; the provider drives everything else.
export function CalendarRtlDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <div class="flex flex-col items-center gap-2">
        <span class="text-xs font-medium text-foreground-subtle">en-US (LTR)</span>
        <I18nProvider locale="en-US">
          <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />
        </I18nProvider>
      </div>

      <div class="flex flex-col items-center gap-2" dir="rtl">
        <span class="text-xs font-medium text-foreground-subtle">ar-EG (RTL)</span>
        <I18nProvider locale="ar-EG">
          <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />
        </I18nProvider>
      </div>
    </div>
  );
}
