import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";

// Live demo for "Logical sides": the same two popovers inside a `dir="rtl"` subtree. `inline-start`
// resolves against the direction the layer is actually rendered into, so it lands on the *right*
// here. The `dir` on `Popover.Positioner` is an ordinary forwarded native attribute — a portaled
// layer inherits direction from `<body>`, not from the trigger's subtree, so this demo hands it the
// direction its anchor lives in.
function LogicalPopover(props: { side: "inline-start" | "inline-end" }) {
  return (
    <Popover.Root size="sm" side={props.side}>
      <Popover.Trigger
        render={(p) => (
          <Button variant="soft" colorScheme="neutral" size="sm" {...(p as ButtonProps)}>
            {props.side}
          </Button>
        )}
      />
      <Popover.Portal>
        <Popover.Positioner dir="rtl">
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>
              <code>{props.side}</code>
            </Popover.Title>
            <Popover.Description>
              Resolved against <code>rtl</code>, so it landed on the{" "}
              {props.side === "inline-start" ? "right" : "left"}.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function PopoverLogicalSideDemo() {
  return (
    <div dir="rtl" class="not-prose flex flex-wrap items-center justify-center gap-2">
      <LogicalPopover side="inline-start" />
      <LogicalPopover side="inline-end" />
    </div>
  );
}
