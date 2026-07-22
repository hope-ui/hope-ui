import { Button } from "@hope-ui/components/button";
import { Calendar } from "@hope-ui/components/calendar";
import { createSignal } from "solid-js";
import { REFERENCE_DATE } from "./data";

// Native form submission, opt-in via `name`: the calendar renders a hidden `<input>` (a sibling of the
// group) valued as the selected date's ISO string, so a plain `<form>` submit carries the value with no
// extra wiring. Submit and watch the captured `FormData` render below; pick a different day and resubmit.
export function CalendarFormDemo() {
  const [submitted, setSubmitted] = createSignal<string | null>(null);

  return (
    <form
      class="flex flex-col items-center gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get("date") ?? ""));
      }}
    >
      <Calendar.Root
        name="date"
        defaultValue={REFERENCE_DATE}
        defaultFocusedValue={REFERENCE_DATE}
      />
      <Button type="submit" size="sm">
        Submit
      </Button>
      <output class="text-sm text-foreground-muted">
        {submitted() ? `Submitted date=${submitted()}` : "Not submitted yet"}
      </output>
    </form>
  );
}
