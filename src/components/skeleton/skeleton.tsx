import { mergeProps, onMount, Show, splitProps } from "solid-js";

import { ColorProps } from "@/styled-system/props/color";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { skeletonStyles } from "./skeleton.styles";
import { Property } from "csstype";
import { fadeIn } from "@/styled-system/keyframes";

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
   * If `true`, it'll render its children with a nice fade transition.
   */
  loaded?: boolean;

  /**
   * The animation speed in CSS unit.
   */
  speed?: Property.AnimationDuration;

  /**
   * The fadeIn duration in CSS unit.
   */
  fadeDuration?: Property.AnimationDuration;
}

export type SkeletonProps<C extends ElementType = "div"> = HTMLHopeProps<C, SkeletonOptions>;

const hopeSkeletonClass = "hope-skeleton";

export function Skeleton<C extends ElementType = "div">(props: SkeletonProps<C>) {
  const defaultProps: SkeletonProps<"div"> = {
    speed: "800ms",
    fadeDuration: "400ms",
  };

  const propsWithDefault: SkeletonProps<"div"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "class",
    "children",
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
      skeletonStyles({
        css: {
          "--hope--startColor": colorTokenToCssVar(local.startColor ?? "$neutral2"),
          "--hope--endColor": colorTokenToCssVar(local.endColor ?? "$neutral8"),
          animationDuration: local.speed,
        },
      })
    );
  };

  const loadedSkeletonClasses = () => {
    return classNames(local.class, hopeSkeletonClass);
  };

  const loadedSkeletonAnimation = () => {
    return `${fadeIn()} ${local.fadeDuration}`;
  };

  return (
    <Show when={local.loaded} fallback={<Box class={skeletonClasses()} {...others} />}>
      <Box class={loadedSkeletonClasses()} animation={loadedSkeletonAnimation()}>
        {local.children}
      </Box>
    </Show>
  );
}

Skeleton.toString = () => createClassSelector(hopeSkeletonClass);

/**
 * Return the css variable associated with the given token if exists, or the token itself otherwise.
 */
function colorTokenToCssVar(token: string): string {
  if (!token.startsWith("$")) {
    return token;
  }

  // ex: "$primary9" -> "var(--hope-colors-primary9)"
  return `var(--hope-colors-${token.substring(1)})`;
}
