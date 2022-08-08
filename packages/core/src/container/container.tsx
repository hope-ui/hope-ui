import {
  ComponentTheme,
  createPolymorphicComponent,
  createStyles,
  DefaultProps,
  hope,
  mapResponsive,
  PartsOf,
  ResponsiveValue,
  useComponentDefaultProps,
} from "@hope-ui/styles";
import { clsx } from "clsx";

import { splitDefaultProps } from "../utils";

export interface ContainerStylesParams {
  /** Whether the container itself should be centered on the page. */
  isCentered: ResponsiveValue<boolean>;

  /** Whether the container should center its children regardless of their width. */
  centerContent: boolean;
}

const useStyles = createStyles((theme, params: ContainerStylesParams) => {
  return {
    root: {
      width: "100%",
      maxWidth: {
        sm: theme.breakpoints.sm,
        md: theme.breakpoints.md,
        lg: theme.breakpoints.lg,
        xl: theme.breakpoints.xl,
        "2xl": theme.breakpoints["2xl"],
      },
      mx: mapResponsive(params.isCentered, isCentered => (isCentered ? "auto" : undefined)),
      ...(params.centerContent && {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }),
    },
  };
});

export type ContainerParts = PartsOf<typeof useStyles>;

export type ContainerProps = DefaultProps<ContainerParts, ContainerStylesParams> &
  Partial<ContainerStylesParams>;

export type ContainerTheme = ComponentTheme<ContainerProps, ContainerParts, ContainerStylesParams>;

/**
 * `Container` is used to constrain a content's width to the current breakpoint, while keeping it fluid.
 *  By default, it sets `margin-left` and `margin-right` to `auto`, to keep its content centered.
 */
export const Container = createPolymorphicComponent<"div", ContainerProps>(props => {
  props = useComponentDefaultProps(
    "Container",
    {
      isCentered: true,
      centerContent: false,
    },
    props
  );

  const [local, others] = splitDefaultProps(props, ["class", "isCentered", "centerContent"]);

  const { styles } = useStyles(local as ContainerStylesParams, { name: "Container" });

  return <hope.div class={clsx("hope-container", local.class)} __css={styles().root} {...others} />;
});
