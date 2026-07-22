import { Calendar } from "@hope-ui/components/calendar";
import { REFERENCE_DATE } from "./data";

// The zero-children convenience API: a bare `<Calendar.Root/>` with no compound parts auto-renders the
// built-in default chrome (navigation header with the chevron nav + heading, then the month grid). Same
// recipe, same behavior as the composed CalendarBasicDemo — the only difference is who authored the parts.
export function CalendarConvenienceDemo() {
  return <Calendar.Root defaultFocusedValue={REFERENCE_DATE} />;
}
