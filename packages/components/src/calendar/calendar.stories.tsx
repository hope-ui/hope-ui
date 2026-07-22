import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Calendar, type CalendarRootProps } from "./index";

const meta = {
  title: "Components/Calendar",
  component: Calendar.Root,
} satisfies Meta<typeof Calendar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Calendar is now a styled recipe-driven component: the look comes entirely from the `calendar` recipe
// resolved through `<ThemeProvider preset={hope}>` (the shadcn/Nova identity), no scoped demo CSS.
// This is where the Phase 2 zero-specificity cascade ordering (today < range-middle < solid endpoints)
// gets its first real visual confirmation, in both light and dark.
function CalendarDemo(props: CalendarRootProps): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Calendar.Root {...props}>
        <Calendar.Header>
          <Calendar.PrevButton aria-label="Previous">‹</Calendar.PrevButton>
          <Calendar.Heading />
          <Calendar.NextButton aria-label="Next">›</Calendar.NextButton>
        </Calendar.Header>
        <Calendar.Grid />
      </Calendar.Root>
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

export const WeekStartsMonday: Story = {
  render: () => <CalendarDemo defaultFocusedValue={june} firstDayOfWeek="mon" />,
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <CalendarDemo defaultFocusedValue={june} dir="rtl" locale="ar-EG" />
    </div>
  ),
};

export const Today: Story = {
  render: () => <CalendarDemo defaultFocusedValue={today(getLocalTimeZone())} />,
};
