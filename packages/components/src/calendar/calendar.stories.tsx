import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Calendar, type CalendarRootProps } from "./calendar";

const meta = {
  title: "Components/Calendar",
  component: Calendar.Root,
} satisfies Meta<typeof Calendar.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Calendar is headless — it ships no styles. This story CSS is the minimum needed to see the grid,
// the chrome, and the per-cell state (`data-*` hooks the primitive emits). It is scoped to `.cal`.
const styles = `
.cal { display: inline-block; font-family: system-ui, sans-serif; border: 1px solid #d0d0d0; border-radius: 8px; padding: 12px; }
.cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
.cal-nav { border: 1px solid #d0d0d0; background: #fff; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; }
.cal-nav:disabled { opacity: 0.4; cursor: default; }
.cal-heading { border: 0; background: transparent; font-weight: 600; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.cal-heading:hover:not(:disabled) { background: #f0f0f0; }
.cal-grid { border-collapse: collapse; }
.cal-grid th { font-size: 12px; font-weight: 500; color: #666; padding: 4px; }
.cal-grid td { padding: 1px; text-align: center; }
.cal-grid td[data-view] { padding: 1px; }
.cal-grid button { width: 40px; height: 36px; border: 0; background: transparent; border-radius: 6px; cursor: pointer; color: #111; }
.cal-grid[data-view="month"] button { width: 36px; }
.cal-grid button:hover { background: #f0f0f0; }
.cal-grid td[data-outside] button { color: #bbb; }
.cal-grid td[data-today] button { outline: 1px solid #888; }
.cal-grid button:focus-visible { outline: 2px solid #2563eb; outline-offset: -2px; }
.cal-grid td[data-selected] button,
.cal-grid td[data-range-start] button,
.cal-grid td[data-range-end] button { background: #2563eb; color: #fff; }
.cal-grid td[data-range-middle] button,
.cal-grid td[data-preview] button { background: #dbeafe; }
.cal-grid button[aria-disabled="true"] { color: #ccc; text-decoration: line-through; cursor: default; }
`;

/** A styled `<Calendar>` composed from the compound parts. */
function CalendarDemo(props: CalendarRootProps): JSX.Element {
  return (
    <>
      <style>{styles}</style>
      <Calendar.Root {...props} class="cal">
        <Calendar.Header class="cal-header">
          <Calendar.PrevButton class="cal-nav" aria-label="Previous">
            ‹
          </Calendar.PrevButton>
          <Calendar.Heading class="cal-heading" />
          <Calendar.NextButton class="cal-nav" aria-label="Next">
            ›
          </Calendar.NextButton>
        </Calendar.Header>
        <Calendar.Grid class="cal-grid" />
      </Calendar.Root>
    </>
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
  // Weekends are unavailable — focusable + announced, but not selectable.
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
