import {
  createPolymorphicComponent,
  hope,
  HopeProps,
  SystemStyleObject,
  SystemStyleProps,
} from "@hope-ui/styles";
import { filterUndefined } from "@hope-ui/utils";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

export interface StackProps extends HopeProps {
  /** Shorthand for `flexDirection` style prop. */
  direction?: SystemStyleProps["flexDirection"];

  /** Shorthand for `flexWrap` style prop. */
  wrap?: SystemStyleProps["flexWrap"];

  /** The space between each child on the X and Y axis. */
  spacing?: SystemStyleProps["gap"];

  /** The space between each child on the X axis. */
  spacingX?: SystemStyleProps["columnGap"];

  /** The space between each child on the Y axis. */
  spacingY?: SystemStyleProps["rowGap"];
}

/**
 * `Stack` makes it easy to stack elements together and apply a space between them.
 */
export const Stack = createPolymorphicComponent<"div", StackProps>(props => {
  const [local, others] = splitProps(props, [
    "class",
    "direction",
    "wrap",
    "spacing",
    "spacingX",
    "spacingY",
  ]);

  return (
    <hope.div
      class={clsx("hope-stack", local.class)}
      __css={filterUndefined<SystemStyleObject>({
        display: "flex",
        alignItems: "center",
        flexDirection: local.direction,
        flexWrap: local.wrap,
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
  reverse?: boolean;
}

/**
 * `HStack` arranges its children in a horizontal line.
 */
export const HStack = createPolymorphicComponent<"div", FixedDirectionStackProps>(props => {
  const [local, others] = splitProps(props, ["reverse"]);

  return <Stack {...others} direction={local.reverse ? "row-reverse" : "row"} />;
});

/**
 * `VStack` arranges its children in a vertical line.
 */
export const VStack = createPolymorphicComponent<"div", FixedDirectionStackProps>(props => {
  const [local, others] = splitProps(props, ["reverse"]);

  return <Stack {...others} direction={local.reverse ? "column-reverse" : "column"} />;
});
