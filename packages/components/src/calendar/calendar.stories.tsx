import { I18nProvider } from "@hope-ui/i18n";
import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Calendar, type CalendarRootProps, type CalendarSize } from "./index";

const meta = {
  title: "Components/Calendar",
  component: Calendar.Root,
} satisfies Meta<typeof Calendar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// The look comes entirely from the theme's `calendar` recipe — there is no demo CSS here. These
// stories are the only place the day-cell cascade order (today < range middle < range endpoints) is
// visible, in both light and dark.
function CalendarDemo(props: CalendarRootProps): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Calendar.Root {...props} />
    </ThemeProvider>
  );
}

const june = new CalendarDate(2026, 6, 15);

export const Default: Story = {
  render: () => <CalendarDemo defaultFocusedValue={june} />,
};

export const Range: Story = {
  render: () => <CalendarDemo selectionMode="range" defaultFocusedValue={june} />,
};

export const Multiple: Story = {
  render: () => <CalendarDemo selectionMode="multiple" defaultFocusedValue={june} />,
};

export const Bounded: Story = {
  render: () => (
    <CalendarDemo
      defaultFocusedValue={june}
      min={new CalendarDate(2026, 6, 5)}
      max={new CalendarDate(2026, 6, 24)}
    />
  ),
};

export const Unavailable: Story = {
  // Weekends are unavailable — focusable + announced, but not selectable (struck through).
  render: () => (
    <CalendarDemo
      defaultFocusedValue={june}
      isDateDisabled={(date) => {
        const weekday = date.toDate("UTC").getUTCDay();
        return weekday === 0 || weekday === 6;
      }}
    />
  ),
};

// The same unavailable weekends, in range mode: pick a weekday and the calendar clamps to that week's
// available run, so a range can never straddle an unavailable day. Pass `allowsNonContiguousRanges`
// to opt out and let a range span them; the unavailable days still drop out of the paint.
export const UnavailableRange: Story = {
  render: () => (
    <CalendarDemo
      selectionMode="range"
      defaultFocusedValue={june}
      isDateDisabled={(date) => {
        const weekday = date.toDate("UTC").getUTCDay();
        return weekday === 0 || weekday === 6;
      }}
    />
  ),
};

// The whole calendar off: every cell is `aria-disabled` with no tab stop, and both nav buttons are
// disabled, so the month can't be paged either. It carries a `defaultValue` that deliberately paints
// nothing — `disabled` makes every cell non-selectable, and a non-selectable day never shows as
// selected. Contrast with `ReadOnly` below: a disabled calendar looks unavailable, a read-only one
// looks normal, keeps showing its value, and refuses to change it.
export const Disabled: Story = {
  render: () => <CalendarDemo defaultFocusedValue={june} defaultValue={june} disabled />,
};

// Navigable and focusable, but not selectable: the grid carries `aria-readonly`, the days keep their
// normal paint and roving tab stop, and clicking one changes nothing.
export const ReadOnly: Story = {
  render: () => <CalendarDemo defaultFocusedValue={june} defaultValue={june} readOnly />,
};

export const WeekStartsMonday: Story = {
  render: () => <CalendarDemo defaultFocusedValue={june} firstDayOfWeek="mon" />,
};

// Both channels declared, which is the contract: `dir="rtl"` mirrors the LAYOUT (the grid's columns,
// the chevrons' rotation), while the provider's locale mirrors the ARROW KEYS and supplies the Arabic
// month name and Arabic-Indic numerals. hope-ui never joins the two for you.
//
// A provider, not a `locale` prop: direction is read from the provider, so a `locale` prop alone
// changes formatting only.
export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <I18nProvider locale="ar-EG">
        <CalendarDemo defaultFocusedValue={june} />
      </I18nProvider>
    </div>
  ),
};

// The half only a story can show: declare the LOCALE and forget the `dir`, and you get Arabic
// numerals and reversed arrows over a grid still laid out left-to-right, Sunday on the left. hope-ui
// will not paper over it — writing `dir` here would override any ancestor the app did set — so it
// warns in dev instead. Open the console on this story to see it.
export const RightToLeftMissingDir: Story = {
  name: "locale without dir (arrows disagree — warns in dev)",
  render: () => (
    <I18nProvider locale="ar-EG">
      <CalendarDemo defaultFocusedValue={june} />
    </I18nProvider>
  ),
};

export const Today: Story = {
  render: () => <CalendarDemo defaultFocusedValue={today(getLocalTimeZone())} />,
};

// A bare `<Calendar.Root/>` with no compound parts renders the built-in chrome itself (navigation
// header with chevrons and heading, then the month grid). Same recipe and same behavior as the
// hand-composed `CalendarDemo` above; the only difference is who authored the parts.
export const Convenience: Story = {
  render: () => (
    <ThemeProvider preset={hope}>
      <Calendar.Root defaultFocusedValue={june} />
    </ThemeProvider>
  ),
};

// The density axis side by side, each with the built-in chrome so the nav button, glyph and cell all
// scale visibly in one shot.
const SIZES: CalendarSize[] = ["sm", "md", "lg"];

export const Sizes: Story = {
  render: () => (
    <ThemeProvider preset={hope}>
      <div style={{ display: "flex", gap: "2rem", "align-items": "flex-start" }}>
        <For each={SIZES}>
          {(size) => (
            <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
              <span style={{ "font-size": "0.75rem", opacity: 0.6 }}>{size}</span>
              <Calendar.Root size={size} defaultFocusedValue={june} />
            </div>
          )}
        </For>
      </div>
    </ThemeProvider>
  ),
};

// Native form submission, opt-in via `name`: the calendar renders a hidden `<input>` (a sibling of the
// group) valued as the selected date's ISO string, so a plain `<form>` submit carries the value. Submit
// and watch the captured `FormData` render below; pick a different day and resubmit to see it change.
export const NativeForm: Story = {
  name: "native form submission (name)",
  render: () => {
    const [submitted, setSubmitted] = createSignal<string | null>(null);
    return (
      <ThemeProvider preset={hope}>
        <form
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "1rem",
            "align-items": "flex-start",
          }}
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(String(new FormData(event.currentTarget).get("date") ?? ""));
          }}
        >
          <Calendar.Root name="date" defaultValue={june} defaultFocusedValue={june} />
          <button type="submit">Submit</button>
          <output style={{ "font-size": "0.875rem" }}>
            {submitted() ? `Submitted date=${submitted()}` : "Not submitted yet"}
          </output>
        </form>
      </ThemeProvider>
    );
  },
};
