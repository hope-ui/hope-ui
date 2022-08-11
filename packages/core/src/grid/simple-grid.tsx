/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/simple-grid.tsx
 */

import {
  createPolymorphicComponent,
  mapResponsive,
  resolveTokenValue,
  ResponsiveValue,
  SystemStyleProps,
  ThemeVars,
  useTheme,
} from "@hope-ui/styles";
import { isNull } from "@hope-ui/utils";
import { splitProps } from "solid-js";

import { Grid, GridProps } from "./grid";

export interface SimpleGridProps extends GridProps {
  /**
   * The width at which child elements will break into columns.
   * Pass a number for pixel values or a string for any other valid CSS length.
   */
  minChildWidth?: SystemStyleProps["minWidth"];

  /** The number of columns. */
  columns?: ResponsiveValue<number>;

  /** The gap between the grid items. */
  spacing?: SystemStyleProps["gap"];

  /** The column gap between the grid items. */
  spacingX?: SystemStyleProps["columnGap"];

  /** The row gap between the grid items. */
  spacingY?: SystemStyleProps["rowGap"];
}

/**
 * `SimpleGrid` uses the `Grid` component and provides a simpler interface to create responsive grid layouts.
 * Provides props that easily define columns and spacing.
 */
export const SimpleGrid = createPolymorphicComponent<"div", SimpleGridProps>(props => {
  const [local, others] = splitProps(props, [
    "minChildWidth",
    "columns",
    "spacing",
    "spacingX",
    "spacingY",
  ]);

  const theme = useTheme();

  const templateColumns = () => {
    if (local.minChildWidth) {
      return widthToColumns(local.minChildWidth, theme.vars);
    }

    return countToColumns(local.columns);
  };

  return (
    <Grid
      gap={local.spacing}
      columnGap={local.spacingX}
      rowGap={local.spacingY}
      templateColumns={templateColumns()}
      {...others}
    />
  );
});

function widthToColumns(width: any, vars: ThemeVars) {
  return mapResponsive(width, value => {
    const _value = resolveTokenValue(value, "sizes", vars);
    return isNull(value) ? null : `repeat(auto-fit, minmax(${_value}, 1fr))`;
  });
}

function countToColumns(count: any) {
  return mapResponsive(count, value => (isNull(value) ? null : `repeat(${value}, minmax(0, 1fr))`));
}
