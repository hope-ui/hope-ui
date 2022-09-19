/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/8546c580fdcaa9653edc6f4813103349a96cfb09/src/mantine-core/src/Transition/Transition.tsx
 */

import { JSX } from "solid-js";

import { createTransition, CreateTransitionProps } from "./create-transition";
import { getTransitionStyles } from "./get-transition-styles";
import { TransitionValue } from "./types";

export interface TransitionProps extends CreateTransitionProps {
  /** Predefined transition name or transition styles. */
  transition: TransitionValue;

  /** Render prop with transition styles argument. */
  children(styles: JSX.CSSProperties): JSX.Element;
}

export function Transition(props: TransitionProps) {
  const { transitionDuration, transitionStatus, transitionTimingFunction } =
    createTransition(props);

  return (
    <>
      {props.children(
        getTransitionStyles({
          transition: props.transition,
          duration: transitionDuration(),
          status: transitionStatus(),
          timingFunction: transitionTimingFunction(),
        })
      )}
    </>
  );
}
