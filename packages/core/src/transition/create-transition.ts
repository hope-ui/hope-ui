/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/8546c580fdcaa9653edc6f4813103349a96cfb09/src/mantine-core/src/Transition/use-transition.ts
 */

import { createReducedMotion } from "@hope-ui/primitives";
import { runIfFn } from "@hope-ui/utils";
import { createEffect, createSignal, on, onCleanup } from "solid-js";

import { mergeDefaultProps } from "../utils";
import { TransitionStatus } from "./get-transition-styles";

export interface CreateTransitionProps {
  /** Whether the component should be mounted. */
  mounted: boolean;

  /** Transition duration (in ms). */
  duration?: number;

  /** Exit transition duration (in ms). */
  exitDuration?: number;

  /** Transition timing function. */
  timingFunction?: string;

  /** Calls when enter transition starts. */
  onEnter?: () => void;

  /** Calls when enter transition ends. */
  onEntered?: () => void;

  /** Calls when exit transition starts. */
  onExit?: () => void;

  /** Calls when exit transition ends. */
  onExited?: () => void;
}

const DEFAULT_DURATION = 250;

export function createTransition(props: CreateTransitionProps) {
  props = mergeDefaultProps(
    {
      duration: DEFAULT_DURATION,
      get exitDuration() {
        return props.duration || DEFAULT_DURATION;
      },
      timingFunction: "ease",
    },
    props
  );

  const reduceMotion = createReducedMotion();

  const [transitionStatus, setStatus] = createSignal<TransitionStatus>(
    props.mounted ? "entered" : "exited"
  );

  const [transitionDuration, setTransitionDuration] = createSignal(
    reduceMotion() ? 0 : props.duration!
  );

  let timeoutId = -1;

  const handleStateChange = (shouldMount: boolean) => {
    const preHandler = shouldMount ? props.onEnter : props.onExit;
    const handler = shouldMount ? props.onEntered : props.onExited;

    setStatus(shouldMount ? "pre-entering" : "pre-exiting");

    window.clearTimeout(timeoutId);

    setTransitionDuration(reduceMotion() ? 0 : shouldMount ? props.duration! : props.exitDuration!);

    if (transitionDuration() === 0) {
      runIfFn(preHandler);
      runIfFn(handler);
      setStatus(shouldMount ? "entered" : "exited");
    } else {
      const preStateTimeout = window.setTimeout(() => {
        runIfFn(preHandler);
        setStatus(shouldMount ? "entering" : "exiting");
      }, 10);

      timeoutId = window.setTimeout(() => {
        window.clearTimeout(preStateTimeout);
        runIfFn(handler);
        setStatus(shouldMount ? "entered" : "exited");
      }, transitionDuration());
    }
  };

  createEffect(
    on(
      () => props.mounted,
      mounted => handleStateChange(mounted),
      { defer: true }
    )
  );

  onCleanup(() => window.clearTimeout(timeoutId));

  return {
    transitionDuration,
    transitionStatus,
    transitionTimingFunction: () => props.timingFunction!,
  };
}
