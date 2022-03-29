import { SizeProps } from "@/styled-system/props/size";
import { createClassSelector } from "@/utils/css";
import { RightJoinProps } from "@/utils/types";

import { ElementType } from "../types";
import { hopeSkeletonClass, Skeleton, SkeletonProps } from "./skeleton";

interface SkeletonCircleOptions {
  /**
   * The size of the circle.
   */
  size?: SizeProps["boxSize"];
}

export type SkeletonCircleProps<C extends ElementType = "div"> = RightJoinProps<
  SkeletonProps<C>,
  SkeletonCircleOptions
>;

export function SkeletonCircle<C extends ElementType = "div">(props: SkeletonCircleProps<C>) {
  return <Skeleton borderRadius="$full" boxSize={props.size ?? "2rem"} {...props} />;
}

SkeletonCircle.toString = () => createClassSelector(hopeSkeletonClass);
