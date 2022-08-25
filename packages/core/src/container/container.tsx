/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/container.tsx
 */

import {
  createHopeComponent,
  createStyles,
  hope,
  mapResponsive,
  ResponsiveValue,
  VariantProps,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { mergeDefaultProps } from "../utils";

const useStyles = createStyles(vars => ({
  base: {
    width: "100%",
    maxWidth: {
      sm: vars.breakpoints.sm,
      md: vars.breakpoints.md,
      lg: vars.breakpoints.lg,
      xl: vars.breakpoints.xl,
      "2xl": vars.breakpoints["2xl"],
    },
  },
  variants: {
    centerContent: {
      true: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      },
      false: {},
    },
  },
  defaultVariants: {
    centerContent: false,
  },
}));

type ContainerVariants = VariantProps<typeof useStyles>;

export type ContainerProps = ContainerVariants & {
  /** Whether the container itself should be centered on the page. */
  isCentered?: ResponsiveValue<boolean>;
};

/**
 * `Container` is used to constrain a content's width to the current breakpoint, while keeping it fluid.
 *  By default, it sets `margin-left` and `margin-right` to `auto`, to keep its content centered.
 */
export const Container = createHopeComponent<"div", ContainerProps>(props => {
  props = mergeDefaultProps({ isCentered: true }, props);

  const [local, others] = splitProps(props, ["class", "isCentered", "centerContent"]);

  const className = useStyles(local);

  return (
    <hope.div
      class={clsx("hope-Container-root", className(), local.class)}
      mx={mapResponsive(local.isCentered, isCentered => (isCentered ? "auto" : undefined))}
      {...others}
    />
  );
});
