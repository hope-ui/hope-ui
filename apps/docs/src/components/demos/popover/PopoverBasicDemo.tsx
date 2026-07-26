import { Button, type ButtonProps } from "@hope-ui/components/button";
import { Popover } from "@hope-ui/components/popover";

// The canonical styled popover for the "Usage" section: a hope `Button` trigger, the measured layer,
// and a card with an arrow, a title and a description. Uncontrolled — the trigger toggles it, and
// Escape / an outside click / Tab-ing away close it. Solid types a native button's `disabled` wider
// than `Button` does, so the trigger's spread is cast (the same bridge `Popover.CloseTrigger` makes
// when it spreads onto `CloseButton`).
export function PopoverBasicDemo() {
  return (
    <Popover.Root>
      <Popover.Trigger render={(p) => <Button {...(p as ButtonProps)}>Share</Button>} />
      <Popover.Portal>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.Arrow />
            <Popover.Title>Share this page</Popover.Title>
            <Popover.Description>
              Anyone with the link can view it. Change who has access in{" "}
              {/* biome-ignore lint/a11y/useValidAnchor: an illustrative link, showing the
                  description slot's link styling. It must stay inert: the docs build prerenders by
                  crawling the hrefs it finds in a live <Preview>, so a made-up route would fail it. */}
              <a href="#">project settings</a>.
            </Popover.Description>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
