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

// Calendar is now a styled recipe-driven component: the look comes entirely from the `calendar` recipe
// resolved through `<ThemeProvider preset={hope}>` (the shadcn/Nova identity), no scoped demo CSS.
// This is where the Phase 2 zero-specificity cascade ordering (today < range-middle < solid endpoints)
// gets its first real visual confirmation, in both light and dark.
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
// available run — every day past the neighbouring weekend goes inert, so a range can never straddle an
// unavailable day. Pass `allowsNonContiguousRanges` to opt out and let a range span them (the
// unavailable days still drop out of the paint).
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

// The whole calendar off: every cell is inert (`aria-disabled` + `data-disabled`, no tab stop) and
// both nav buttons are disabled, so the month can't be paged either. It has a `defaultValue`, which
// deliberately paints nothing: `disabled` makes every cell non-selectable, and React Aria drops
// non-selectable days out of the selection paint. Contrast with `ReadOnly` below — a disabled
// calendar looks unavailable; a read-only one looks normal, keeps showing its value, and refuses to
// change it.
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

export const RightToLeft: Story = {
  // No `dir` wrapper: `Calendar.Root` emits its own `dir` prop onto the group element, so the prop
  // alone mirrors the CSS layout as well as flipping the arrow keys. A wrapper here would hide a
  // regression in exactly that.
  render: () => <CalendarDemo defaultFocusedValue={june} dir="rtl" locale="ar-EG" />,
};

export const Today: Story = {
  render: () => <CalendarDemo defaultFocusedValue={today(getLocalTimeZone())} />,
};

// ── Phase 4: convenience (auto-chrome) API ──────────────────────────────────────────────────────
// The zero-children ergonomics. A bare `<Calendar.Root/>` — no compound parts — auto-renders the
// built-in default chrome (navigation header with the chevron nav + heading, then the month grid).
// Same recipe, same behavior as the compound `CalendarDemo` above; the only difference is who authored
// the parts (Root's internal `DefaultCalendar` vs the consumer).
export const Convenience: Story = {
  render: () => (
    <ThemeProvider preset={hope}>
      <Calendar.Root defaultFocusedValue={june} />
    </ThemeProvider>
  ),
};

// The `size` density axis (`sm`/`md`/`lg`) side by side, each on the convenience API so the default
// chrome's nav-button + glyph + cell scaling is visible in one shot.
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
