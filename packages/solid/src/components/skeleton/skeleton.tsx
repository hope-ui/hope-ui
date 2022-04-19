import { Property } from "csstype";
import { createEffect, createSignal, mergeProps, on, Show, splitProps } from "solid-js";

import { fadeIn } from "../../styled-system/keyframes";
import { ColorProps } from "../../styled-system/props/color";
import { colorTokenToCssVar } from "../../styled-system/utils";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { skeletonStyles } from "./skeleton.styles";

/* -------------------------------------------------------------------------------------------------
 * Skeleton
 * -----------------------------------------------------------------------------------------------*/

interface SkeletonOptions {
  /**
   * The color at the animation start.
   */
  startColor?: ColorProps["backgroundColor"];

  /**
   * The color at the animation end.
   */
  endColor?: ColorProps["backgroundColor"];

  /**
   * The animation speed in CSS unit.
   */
  speed?: Property.AnimationDuration;

  /**
   * The loaded children fadeIn animation duration in CSS unit.
   */
  fadeDuration?: Property.AnimationDuration;

  /**
   * If `true`, it'll render its children with a nice fade animation.
   */
  loaded?: boolean;
}

export type SkeletonProps<C extends ElementType = "div"> = HTMLHopeProps<C, SkeletonOptions>;

export const hopeSkeletonClass = "hope-skeleton";

export function Skeleton<C extends ElementType = "div">(props: SkeletonProps<C>) {
  // Animation when the content is loaded
  const [loadedAnimation, setLoadedAnimation] = createSignal("none");

  const defaultProps: SkeletonProps<"div"> = {
    speed: "800ms",
    fadeDuration: "400ms",
  };

  const propsWithDefault: SkeletonProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "startColor",
    "endColor",
    "loaded",
    "speed",
    "fadeDuration",
  ]);

  const skeletonClasses = () => {
    return classNames(
      local.class,
      hopeSkeletonClass,
      local.loaded
        ? undefined
        : skeletonStyles({
            css: {
              $$startColor: colorTokenToCssVar(local.startColor ?? "$neutral2"),
              $$endColor: colorTokenToCssVar(local.endColor ?? "$neutral8"),
              animationDuration: local.speed,
            },
          })
    );
  };

  // The animation only applies when `loaded` goes from false to true.
  createEffect(
    on(
      () => local.loaded,
      (_, prev) => setLoadedAnimation(prev === true ? "none" : `${fadeIn()} ${local.fadeDuration}`),
      { defer: true }
    )
  );

  return (
    <Show when={local.loaded} fallback={<Box class={skeletonClasses()} {...others} />}>
      <Box class={skeletonClasses()} animation={loadedAnimation()} {...others} />
    </Show>
  );
}

Skeleton.toString = () => createClassSelector(hopeSkeletonClass);
