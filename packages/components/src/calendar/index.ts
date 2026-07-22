import { Grid } from "./calendar-grid";
import { Header } from "./calendar-header";
import { Heading } from "./calendar-heading";
import { NextButton } from "./calendar-next-button";
import { PrevButton } from "./calendar-prev-button";
import { Root } from "./calendar-root";

export type { CalendarGridProps } from "./calendar-grid";
export type { CalendarHeaderProps } from "./calendar-header";
export type { CalendarHeadingProps } from "./calendar-heading";
export type { CalendarNextButtonProps } from "./calendar-next-button";
export type { CalendarPrevButtonProps } from "./calendar-prev-button";
export type { CalendarRootProps, CalendarSize } from "./calendar-root";

/**
 * The Calendar compound component. `Root` calls `createCalendar` for the shared state + resolves the
 * recipe; the chrome parts (`Header`/`PrevButton`/`Heading`/`NextButton`) and `Grid` read it off
 * context. Requires a `<ThemeProvider>` ancestor (fed a preset), like every styled component.
 */
export const Calendar = { Root, Header, PrevButton, NextButton, Heading, Grid };
