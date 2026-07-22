import { Calendar } from "@hope-ui/components/calendar";
import { getReadingDirection, I18nProvider } from "@hope-ui/i18n";
import {
  BuddhistCalendar,
  type CalendarDate,
  IslamicUmalquraCalendar,
  JapaneseCalendar,
  toCalendar,
} from "@internationalized/date";
import { For } from "solid-js";
import { REFERENCE_DATE } from "./data";

// Non-Gregorian calendar systems. `toCalendar` reprojects the same instant into another calendar, and
// pairing it with a `-u-ca-` locale aligns the formatting: the heading, weekday names, era, and day
// numbers all render in that system + its numbering scheme. Because the day numbers are formatted from
// the date's own calendar (not the locale's default), the grid and the heading agree.
const SYSTEMS: { label: string; locale: string; date: CalendarDate }[] = [
  {
    label: "Islamic (Umm al-Qura)",
    locale: "ar-SA-u-ca-islamic-umalqura",
    date: toCalendar(REFERENCE_DATE, new IslamicUmalquraCalendar()),
  },
  {
    label: "Japanese",
    locale: "ja-JP-u-ca-japanese",
    date: toCalendar(REFERENCE_DATE, new JapaneseCalendar()),
  },
  {
    label: "Buddhist",
    locale: "th-TH-u-ca-buddhist",
    date: toCalendar(REFERENCE_DATE, new BuddhistCalendar()),
  },
];

export function CalendarNonGregorianDemo() {
  return (
    <div class="flex flex-wrap items-start justify-center gap-8">
      <For each={SYSTEMS}>
        {(system) => (
          <div class="flex flex-col items-center gap-2" dir={getReadingDirection(system.locale)}>
            <span class="text-xs font-medium text-foreground-subtle">{system.label}</span>
            <I18nProvider locale={system.locale}>
              <Calendar.Root defaultFocusedValue={system.date} />
            </I18nProvider>
          </div>
        )}
      </For>
    </div>
  );
}
