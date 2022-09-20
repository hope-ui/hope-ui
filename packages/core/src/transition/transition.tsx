/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/8546c580fdcaa9653edc6f4813103349a96cfb09/src/mantine-core/src/Transition/Transition.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { createMemo, JSX, Show, splitProps } from "solid-js";

import { createTransition, CreateTransitionProps } from "./create-transition";
import { getTransitionStyles } from "./get-transition-styles";
import { HopeTransition } from "./types";

export interface TransitionProps extends CreateTransitionProps {
  /** Predefined transition name or transition styles. */
  animate: HopeTransition;

  /** The css style attribute (should be an object). */
  style?: JSX.CSSProperties;
}

/**
 * `Transition` component allow to work with enter/exit transitions.
 * It comes with pre-made transitions and option to create custom ones based on CSS properties.
 */
export const Transition = createHopeComponent<"div", TransitionProps>(props => {
  const [local, others] = splitProps(props, [
    "animate",
    "isMounted",
    "duration",
    "delay",
    "easing",
    "exitDuration",
    "exitDelay",
    "exitEasing",
    "onBeforeEnter",
    "onAfterEnter",
    "onBeforeExit",
    "onAfterExit",
    "style",
  ]);

  const { transitionDuration, transitionStatus, transitionTimingFunction } =
    createTransition(local);

  const computedStyle = createMemo(() => ({
    ...getTransitionStyles({
      transition: local.animate,
      duration: transitionDuration(),
      status: transitionStatus(),
      timingFunction: transitionTimingFunction(),
    }),
    ...local.style,
  }));

  return (
    <Show when={transitionStatus() !== "afterExit"}>
      <hope.div style={computedStyle()} {...others} />
    </Show>
  );
});
