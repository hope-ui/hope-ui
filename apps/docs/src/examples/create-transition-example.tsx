import {
  Button,
  DEFAULT_TRANSITIONS_NAMES,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TransitionName,
} from "@hope-ui/core";
import { For } from "solid-js";

export function PredefinedTransitionsExample() {
  const getPlacement = (transition: TransitionName) => {
    return ["slide-up", "pop-top-left", "pop-top-right"].includes(transition) ? "bottom" : "top";
  };

  return (
    <HStack wrap="wrap" justify="center" gap={6}>
      <For each={DEFAULT_TRANSITIONS_NAMES}>
        {transition => (
          <Popover
            triggerMode="hover"
            withArrow={false}
            openDelay={0}
            closeDelay={0}
            placement={getPlacement(transition)}
            transitionOptions={{ transition }}
          >
            <PopoverTrigger as={Button} variant="soft" size="sm">
              {transition}
            </PopoverTrigger>
            <PopoverContent w="max-content" p={2}>
              <p>{transition}</p>
            </PopoverContent>
          </Popover>
        )}
      </For>
    </HStack>
  );
}
