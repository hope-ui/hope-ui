import { createMemo, Index, mergeProps, Show, splitProps } from "solid-js";

import { GridLayoutProps } from "../../styled-system/props/grid";
import { SizeProps } from "../../styled-system/props/size";
import { classNames, createClassSelector } from "../../utils/css";
import { range } from "../../utils/function";
import { OverrideProps } from "../../utils/types";
import { Box } from "../box/box";
import { ElementType } from "../types";
import { hopeSkeletonClass, Skeleton, SkeletonProps } from "./skeleton";

interface SkeletonTextOptions {
  /**
   * The number of skeleton text lines.
   */
  noOfLines?: number;

  /**
   * The space between each skeleton text line.
   */
  spacing?: GridLayoutProps["gap"];

  /**
   * The height of each skeleton text line.
   */
  skeletonHeight?: SizeProps["height"];
}

export type SkeletonTextProps<C extends ElementType = "div"> = OverrideProps<SkeletonProps<C>, SkeletonTextOptions>;

export function SkeletonText<C extends ElementType = "div">(props: SkeletonTextProps<C>) {
  const defaultProps: SkeletonTextProps<"div"> = {
    noOfLines: 3,
    spacing: "0.5rem",
    skeletonHeight: "0.5rem",
  };

  const propsWithDefault: SkeletonTextProps<"div"> = mergeProps(defaultProps, props);
  const [local, skeletonProps, others] = splitProps(
    propsWithDefault,
    ["class", "children", "noOfLines", "spacing", "skeletonHeight"],
    ["startColor", "endColor", "loaded", "speed", "fadeDuration", "borderRadius", "rounded"]
  );

  const noOfLines = () => local.noOfLines ?? 3;

  const numbers = createMemo(() => range(noOfLines()));

  const getWidth = (index: number) => {
    if (noOfLines() > 1) {
      return index === numbers().length - 1 ? "80%" : "100%";
    }

    return "100%";
  };

  const classes = () => {
    return classNames(local.class, "hope-skeleton__group");
  };

  return (
    <Show
      when={skeletonProps.loaded}
      fallback={
        <Box class={classes()} d="flex" flexDirection="column" gap={local.spacing} {...others}>
          <Index each={numbers()}>
            {(_, index) => <Skeleton width={getWidth(index)} height={local.skeletonHeight} {...skeletonProps} />}
          </Index>
        </Box>
      }
    >
      <Skeleton class={local.class} {...skeletonProps} {...others}>
        {local.children}
      </Skeleton>
    </Show>
  );
}

SkeletonText.toString = () => createClassSelector(hopeSkeletonClass);
