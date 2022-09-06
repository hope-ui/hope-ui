/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/stack.tsx
 */

import {
  createHopeComponent,
  hope,
  mapResponsive,
  ResponsiveValue,
  SystemStyleObject,
  SystemStyleProps,
} from "@hope-ui/styles";
import { filterUndefined } from "@hope-ui/utils";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { mergeDefaultProps } from "../utils";

export interface StackProps {
  /** Shorthand for `flexDirection` style prop. */
  direction?: SystemStyleProps["flexDirection"];

  /** Shorthand for `flexWrap` style prop. */
  wrap?: SystemStyleProps["flexWrap"];

  /** Shorthand for `alignItems` style prop. */
  align?: SystemStyleProps["alignItems"];

  /** Shorthand for `justifyContent` style prop. */
  justify?: SystemStyleProps["justifyContent"];

  /** The space between the stack items. */
  spacing?: SystemStyleProps["gap"];

  /** The space between the stack items on the X axis. */
  spacingX?: SystemStyleProps["columnGap"];

  /** The space between the stack items on the Y axis. */
  spacingY?: SystemStyleProps["rowGap"];
}

/**
 * `Stack` makes it easy to stack elements together and apply a space between them.
 */
export const Stack = createHopeComponent<"div", StackProps>(props => {
  props = mergeDefaultProps({ align: "center" }, props);

  const [local, others] = splitProps(props, [
    "class",
    "direction",
    "wrap",
    "align",
    "justify",
    "spacing",
    "spacingX",
    "spacingY",
  ]);

  return (
    <hope.div
      class={clsx("hope-Stack-root", local.class)}
      __css={filterUndefined<SystemStyleObject>({
        display: "flex",
        flexDirection: local.direction,
        flexWrap: local.wrap,
        alignItems: local.align,
        justifyContent: local.justify,
        gap: local.spacing,
        columnGap: local.spacingX,
        rowGap: local.spacingY,
      })}
      {...others}
    />
  );
});

export interface FixedDirectionStackProps extends Omit<StackProps, "direction" | "flexDirection"> {
  /** Whether the direction should be reversed. */
  reverse?: ResponsiveValue<boolean>;
}

/**
 * `HStack` arranges its children in a horizontal line.
 */
export const HStack = createHopeComponent<"div", FixedDirectionStackProps>(props => {
  props = mergeDefaultProps({ reverse: false }, props);

  const [local, others] = splitProps(props, ["reverse"]);

  return (
    <Stack
      {...others}
      direction={mapResponsive(local.reverse, reverse => (reverse ? "row-reverse" : "row"))}
    />
  );
});

/**
 * `VStack` arranges its children in a vertical line.
 */
export const VStack = createHopeComponent<"div", FixedDirectionStackProps>(props => {
  props = mergeDefaultProps({ reverse: false }, props);

  const [local, others] = splitProps(props, ["reverse"]);

  return (
    <Stack
      {...others}
      direction={mapResponsive(local.reverse, reverse => (reverse ? "column-reverse" : "column"))}
    />
  );
});
