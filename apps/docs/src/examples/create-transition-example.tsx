import {
  Box,
  Button,
  createTransition,
  DEFAULT_TRANSITIONS_NAMES,
  HStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  TransitionName,
} from "@hope-ui/core";
import { createSignal, For, Show } from "solid-js";

export function BasicExample() {
  const [show, setShow] = createSignal(false);

  const { style } = createTransition({
    shouldMount: show,
    transition: "fade",
    duration: 400,
    easing: "ease",
  });

  return (
    <>
      <Button onClick={() => setShow(prev => !prev)}>{show() ? "Hide" : "Show"}</Button>
      <Box p={4} color="white" mt="4" bg="primary.500" rounded="md" shadow="md" style={style()}>
        Animated box.
      </Box>
    </>
  );
}

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

export function CustomTransitionExample() {
  const [show, setShow] = createSignal(false);

  const { style } = createTransition({
    shouldMount: show,
    transition: {
      in: { opacity: 1, transform: "scaleY(1)" },
      out: { opacity: 0, transform: "scaleY(0)" },
      common: { "transform-origin": "top" },
    },
    duration: 400,
    easing: "ease",
  });

  return (
    <>
      <Button onClick={() => setShow(prev => !prev)}>{show() ? "Hide" : "Show"}</Button>
      <Box p={4} color="white" mt="4" bg="primary.500" rounded="md" shadow="md" style={style()}>
        Animated box.
      </Box>
    </>
  );
}

export function UnmountOnExitExample() {
  const [show, setShow] = createSignal(false);

  const { style, keepMounted } = createTransition({
    shouldMount: show,
    transition: "fade",
    duration: 400,
    easing: "ease",
  });

  return (
    <>
      <Button onClick={() => setShow(prev => !prev)}>{show() ? "Hide" : "Show"}</Button>
      <Show when={keepMounted()}>
        <Box p={4} color="white" mt="4" bg="primary.500" rounded="md" shadow="md" style={style()}>
          Animated box.
        </Box>
      </Show>
    </>
  );
}
