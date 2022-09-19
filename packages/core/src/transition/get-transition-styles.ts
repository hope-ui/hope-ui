/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/8546c580fdcaa9653edc6f4813103349a96cfb09/src/mantine-core/src/Transition/get-transition-styles/get-transition-styles.ts
 */

import { isString } from "@hope-ui/utils";
import { JSX } from "solid-js";

import { DEFAULT_TRANSITIONS } from "./default-transitions";
import { TransitionValue } from "./types";

const TRANSITION_STATUSES = {
  entering: "in",
  entered: "in",
  exiting: "out",
  exited: "out",
  "pre-entering": "out",
  "pre-exiting": "out",
} as const;

export type TransitionStatus = keyof typeof TRANSITION_STATUSES;

interface GetTransitionStylesParams {
  transition: TransitionValue;
  status: TransitionStatus;
  duration: number;
  timingFunction: JSX.CSSProperties["transition-timing-function"];
}

export function getTransitionStyles(params: GetTransitionStylesParams): JSX.CSSProperties {
  const shared: JSX.CSSProperties = {
    "transition-duration": `${params.duration}ms`,
    "transition-timing-function": params.timingFunction,
  };

  if (isString(params.transition)) {
    if (!(params.transition in DEFAULT_TRANSITIONS)) {
      return {};
    }

    const transitionStyles = DEFAULT_TRANSITIONS[params.transition];

    return {
      "transition-property": transitionStyles.transitionProperty,
      ...shared,
      ...transitionStyles.common,
      ...transitionStyles[TRANSITION_STATUSES[params.status]],
    };
  }

  return {
    "transition-property": params.transition.transitionProperty,
    ...shared,
    ...params.transition.common,
    ...params.transition[TRANSITION_STATUSES[params.status]],
  };
}
