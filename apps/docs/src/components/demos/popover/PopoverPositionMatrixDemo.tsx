import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";
import { For } from "solid-js";

// Every `side` × `align` combination, laid out as a matrix: one row per physical side, one column
// per alignment. The two logical sides (`inline-start`/`inline-end`) are deliberately absent — they
// resolve to one of these four against the reading direction, so they get their own RTL demo rather
// than eight more cells that duplicate these.
const SIDES = ["top", "right", "bottom", "left"] as const;
const ALIGNS = ["start", "center", "end"] as const;

type Side = (typeof SIDES)[number];
type Align = (typeof ALIGNS)[number];

// One cell: a full-width trigger whose card names the combination that placed it. `size="sm"` keeps
// twelve cards from dwarfing the grid that opens them.
function MatrixPopover(props: { side: Side; align: Align }) {
  return (
    <Popover.Root size="sm" side={props.side} align={props.align}>
      <Popover.Trigger
        render={(p) => (
          <Button variant="soft" colorScheme="neutral" size="sm" fullWidth {...(p as ButtonProps)}>
            {props.align}
          </Button>
        )}
      />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>
              <code>{props.side}</code> · <code>{props.align}</code>
            </Popover.Title>
            <Popover.Description>
              Placed on the {props.side} of its trigger, aligned to its {props.align}.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

// Live demo for "Positioning": the full matrix. A leading column names each side and a header row
// each alignment, so the cell label alone stays short enough for a `sm` button.
export function PopoverPositionMatrixDemo() {
  return (
    <div class="not-prose w-full max-w-md">
      <div class="grid grid-cols-[3.5rem_repeat(3,minmax(0,1fr))] items-center gap-2">
        <div />
        <For each={ALIGNS}>
          {(align) => (
            <div class="text-center font-medium text-foreground-subtle text-xs">{align}</div>
          )}
        </For>

        <For each={SIDES}>
          {(side) => (
            <>
              <div class="text-end font-medium text-foreground-subtle text-xs">{side}</div>
              <For each={ALIGNS}>{(align) => <MatrixPopover side={side} align={align} />}</For>
            </>
          )}
        </For>
      </div>
    </div>
  );
}
