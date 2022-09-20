/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/8546c580fdcaa9653edc6f4813103349a96cfb09/src/mantine-core/src/Transition/use-transition.ts
 */

import { createReducedMotion } from "@hope-ui/primitives";
import { Property } from "@hope-ui/styles";
import { createEffect, createSignal, on, onCleanup } from "solid-js";

import { mergeDefaultProps } from "../utils";
import { TransitionStatus } from "./get-transition-styles";

export interface CreateTransitionProps {
  /** Whether the component should be mounted. */
  isMounted: boolean;

  /** Transitions duration (in ms). */
  duration?: number;

  /** Delay before starting transitions (in ms). */
  delay?: number;

  /** Transitions timing function. */
  easing?: Property.TransitionTimingFunction;

  /** Exit transition duration (in ms). */
  exitDuration?: number;

  /** Delay before starting the exit transition (in ms). */
  exitDelay?: number;

  /** Exit transition timing function. */
  exitEasing?: Property.TransitionTimingFunction;

  /** Calls when enter transition starts. */
  onBeforeEnter?: () => void;

  /** Calls when enter transition ends. */
  onAfterEnter?: () => void;

  /** Calls when exit transition starts. */
  onBeforeExit?: () => void;

  /** Calls when exit transition ends. */
  onAfterExit?: () => void;
}

const DEFAULT_DURATION = 250;
const DEFAULT_DELAY = 10;
const DEFAULT_EASING: Property.TransitionTimingFunction = "ease";

export function createTransition(props: CreateTransitionProps) {
  props = mergeDefaultProps(
    {
      duration: DEFAULT_DURATION,
      delay: DEFAULT_DELAY,
      easing: DEFAULT_EASING,
      get exitDuration() {
        return props.duration || DEFAULT_DURATION;
      },
      get exitDelay() {
        return props.delay || DEFAULT_DELAY;
      },
      get exitEasing() {
        return props.easing || DEFAULT_EASING;
      },
    },
    props
  );

  const reduceMotion = createReducedMotion();

  const [transitionStatus, setStatus] = createSignal<TransitionStatus>(
    props.isMounted ? "afterEnter" : "afterExit"
  );

  const [transitionDuration, setTransitionDuration] = createSignal(
    reduceMotion() ? 0 : props.duration!
  );

  const [transitionTimingFunction, setTransitionTimingFunction] = createSignal(props.easing!);

  let timeoutId = -1;

  const handleStateChange = (shouldMount: boolean) => {
    const preHandler = shouldMount ? props.onBeforeEnter : props.onBeforeExit;
    const postHandler = shouldMount ? props.onAfterEnter : props.onAfterExit;

    setStatus(shouldMount ? "beforeEnter" : "beforeExit");

    window.clearTimeout(timeoutId);

    const duration = setTransitionDuration(
      reduceMotion() ? 0 : shouldMount ? props.duration! : props.exitDuration!
    );

    setTransitionTimingFunction(shouldMount ? props.easing! : props.exitEasing!);

    if (duration === 0) {
      preHandler?.();
      postHandler?.();
      setStatus(shouldMount ? "afterEnter" : "afterExit");
      return;
    }

    const delay = reduceMotion() ? 0 : shouldMount ? props.delay! : props.exitDelay!;

    const preStateTimeoutId = window.setTimeout(() => {
      preHandler?.();
      setStatus(shouldMount ? "enter" : "exit");
    }, delay);

    timeoutId = window.setTimeout(() => {
      window.clearTimeout(preStateTimeoutId);
      postHandler?.();
      setStatus(shouldMount ? "afterEnter" : "afterExit");
    }, delay + duration);
  };

  createEffect(
    on(
      () => props.isMounted,
      isMounted => handleStateChange(isMounted),
      { defer: true }
    )
  );

  onCleanup(() => window.clearTimeout(timeoutId));

  return {
    transitionDuration,
    transitionStatus,
    transitionTimingFunction,
  };
}
