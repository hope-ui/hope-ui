/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/8546c580fdcaa9653edc6f4813103349a96cfb09/src/mantine-core/src/Transition/use-transition.ts
 */

import { createReducedMotion } from "@hope-ui/primitives";
import { Property } from "@hope-ui/styles";
import { access, MaybeAccessor } from "@hope-ui/utils";
import { createEffect, createMemo, createSignal, on, onCleanup } from "solid-js";

import { mergeDefaultProps } from "../utils";
import { getTransitionStyles, TransitionPhase } from "./get-transition-styles";
import { HopeTransition } from "./types";

export interface CreateTransitionProps {
  /** Predefined transition name or transition styles. */
  transition: MaybeAccessor<HopeTransition>;

  /** Whether the component should be mounted. */
  isMounted: MaybeAccessor<boolean>;

  /** Transitions duration (in ms). */
  duration?: MaybeAccessor<number | undefined>;

  /** Exit transition duration (in ms). */
  exitDuration?: MaybeAccessor<number | undefined>;

  /** Delay before starting transitions (in ms). */
  delay?: MaybeAccessor<number | undefined>;

  /** Delay before starting the exit transition (in ms). */
  exitDelay?: MaybeAccessor<number | undefined>;

  /** Transitions timing function. */
  easing?: MaybeAccessor<Property.TransitionTimingFunction | undefined>;

  /** Exit transition timing function. */
  exitEasing?: MaybeAccessor<Property.TransitionTimingFunction | undefined>;

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
        return access(props.duration) || DEFAULT_DURATION;
      },
      get exitDelay() {
        return access(props.delay) || DEFAULT_DELAY;
      },
      get exitEasing() {
        return access(props.easing) || DEFAULT_EASING;
      },
    },
    props
  );

  const reduceMotion = createReducedMotion();

  const [duration, setDuration] = createSignal(reduceMotion() ? 0 : access(props.duration)!);

  const [phase, setPhase] = createSignal<TransitionPhase>(
    access(props.isMounted) ? "afterEnter" : "afterExit"
  );

  const [easing, setEasing] = createSignal(access(props.easing)!);

  let timeoutId = -1;

  const handleStateChange = (shouldMount: boolean) => {
    const preHandler = shouldMount ? props.onBeforeEnter : props.onBeforeExit;
    const postHandler = shouldMount ? props.onAfterEnter : props.onAfterExit;

    setPhase(shouldMount ? "beforeEnter" : "beforeExit");

    window.clearTimeout(timeoutId);

    const newDuration = setDuration(
      reduceMotion() ? 0 : shouldMount ? access(props.duration)! : access(props.exitDuration)!
    );

    setEasing(shouldMount ? access(props.easing)! : access(props.exitEasing)!);

    if (newDuration === 0) {
      preHandler?.();
      postHandler?.();
      setPhase(shouldMount ? "afterEnter" : "afterExit");
      return;
    }

    const delay = reduceMotion()
      ? 0
      : shouldMount
      ? access(props.delay)!
      : access(props.exitDelay)!;

    const preStateTimeoutId = window.setTimeout(() => {
      preHandler?.();
      setPhase(shouldMount ? "enter" : "exit");
    }, delay);

    timeoutId = window.setTimeout(() => {
      window.clearTimeout(preStateTimeoutId);
      postHandler?.();
      setPhase(shouldMount ? "afterEnter" : "afterExit");
    }, delay + newDuration);
  };

  const style = createMemo(() =>
    getTransitionStyles({
      transition: access(props.transition),
      duration: duration(),
      phase: phase(),
      easing: easing(),
    })
  );

  const keepMounted = createMemo(() => phase() !== "afterExit");

  createEffect(
    on(
      () => access(props.isMounted),
      isMounted => handleStateChange(isMounted),
      { defer: true }
    )
  );

  onCleanup(() => window.clearTimeout(timeoutId));

  return { keepMounted, style };
}
