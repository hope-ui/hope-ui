import { Property } from "csstype";
import { children, mergeProps, Show, splitProps } from "solid-js";
import { Transition } from "solid-transition-group";

import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { collapseStyles } from "./collapse.styles";

interface CollapseOptions {
  /**
   * If `true`, the collapse will be expanded.
   */
  expanded?: boolean;

  /**
   * If `true`, the opacity of the content will be animated.
   */
  animateOpacity?: boolean;

  /**
   * Duration of the expand transition in ms.
   */
  expandDuration?: number;

  /**
   * Timing function of the expand transition.
   */
  expandTimingFunction?: Property.TransitionTimingFunction;

  /**
   * Duration of the collapse transition in ms.
   */
  collapseDuration?: number;

  /**
   * Duration of the expand collapse in ms.
   */
  collapseTimingFunction?: Property.TransitionTimingFunction;

  /**
   * If `true`, the element stays mounted when collapsed.
   */
  keepAlive?: boolean;
}

export type CollapseProps<C extends ElementType = "div"> = HTMLHopeProps<C, CollapseOptions>;

const hopeCollapseClass = "hope-collapse";

export function Collapse<C extends ElementType = "div">(props: CollapseProps<C>) {
  const defaultProps: CollapseProps<"div"> = {
    animateOpacity: true,
    expandDuration: 300,
    expandTimingFunction: "ease",
    collapseDuration: 300,
    collapseTimingFunction: "ease",
    keepAlive: true,
  };

  const propsWithDefault: CollapseProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
    "expanded",
    "animateOpacity",
    "expandDuration",
    "expandTimingFunction",
    "collapseDuration",
    "collapseTimingFunction",
    "keepAlive",
  ]);

  const resolvedChildren = children(() => local.children);

  const classes = () => {
    return classNames(local.class, hopeCollapseClass, collapseStyles());
  };

  const collapsedStyles = () => {
    const styles = {
      height: 0,
    };

    if (local.animateOpacity) {
      return {
        ...styles,
        opacity: 0,
      };
    }

    return styles;
  };

  const expandedStyles = (el: Element) => {
    const styles = {
      height: `${el.scrollHeight}px`,
    };

    if (local.animateOpacity) {
      return {
        ...styles,
        opacity: 1,
      };
    }

    return styles;
  };

  const onEnterTransition = (el: Element, done: () => void) => {
    const animation = el.animate([collapsedStyles(), expandedStyles(el)], {
      duration: local.expandDuration,
      easing: local.expandTimingFunction,
    });

    animation.finished.then(done);
  };

  const onExitTransition = (el: Element, done: () => void) => {
    const animation = el.animate([expandedStyles(el), collapsedStyles()], {
      duration: local.collapseDuration,
      easing: local.collapseTimingFunction,
    });

    animation.finished.then(done);
  };

  return (
    <Transition onEnter={onEnterTransition} onExit={onExitTransition}>
      <Show when={local.expanded}>
        <Box class={classes()} {...others}>
          <Show when={local.keepAlive} fallback={local.children}>
            {resolvedChildren()}
          </Show>
        </Box>
      </Show>
    </Transition>
  );
}

Collapse.toString = () => createClassSelector(hopeCollapseClass);
