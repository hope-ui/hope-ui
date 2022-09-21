/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/8546c580fdcaa9653edc6f4813103349a96cfb09/src/mantine-core/src/Transition/Transition.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { ComponentProps, createMemo, JSX, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { OptionalPortal } from "../portal";
import { createTransition, CreateTransitionProps } from "./create-transition";

export interface TransitionProps extends CreateTransitionProps {
  /** The css style attribute (should be an object). */
  style?: JSX.CSSProperties;

  /** Whether the component should be rendered in a `Portal`. */
  withinPortal?: boolean;

  /** Props to be passed to the `Portal` component. */
  portalProps?: Omit<ComponentProps<typeof Portal>, "children">;
}

/**
 * `Transition` component allow to work with enter/exit transitions.
 * It comes with pre-made transitions, option to create custom ones and renders a `div` by default.
 */
export const Transition = createHopeComponent<"div", TransitionProps>(props => {
  const [local, transitionProps, others] = splitProps(
    props,
    ["style", "withinPortal", "portalProps"],
    [
      "transition",
      "isMounted",
      "duration",
      "exitDuration",
      "delay",
      "exitDelay",
      "easing",
      "exitEasing",
      "onBeforeEnter",
      "onAfterEnter",
      "onBeforeExit",
      "onAfterExit",
    ]
  );

  const { keepMounted, style } = createTransition(transitionProps);

  const computedStyle = createMemo(() => ({
    ...style(),
    ...local.style,
  }));

  return (
    <Show when={keepMounted()}>
      <OptionalPortal withinPortal={local.withinPortal} {...local.portalProps}>
        <hope.div style={computedStyle()} {...others} />
      </OptionalPortal>
    </Show>
  );
});
