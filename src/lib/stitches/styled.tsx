import { createMemo, mergeProps, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { ElementType, StyledComponent } from "../components/types";
import { css, SystemStyleObject } from "./stitches.config";

export function styled<T extends ElementType>(element: T, styles: SystemStyleObject = {}) {
  const cssComponent = css(styles);

  const styledComponent: StyledComponent<T> = props => {
    const propsWithDefault = mergeProps({ as: element, css: {} }, props);

    const memoizedProps = createMemo(() => {
      const forwardProps = cssComponent(propsWithDefault).props;

      // @ts-ignore
      return splitProps(forwardProps, ["as"]);
    });

    const local = () => memoizedProps()[0];
    const others = () => memoizedProps()[1];

    // @ts-ignore
    return <Dynamic {...others()} component={local().as} />;
  };

  /*
   * In order to target a styledComponent in a stitches css selector.
   * Like this : https://stitches.dev/docs/styling#target-a-stitches-component
   */
  styledComponent.toString = () => cssComponent.selector;

  return styledComponent;
}
