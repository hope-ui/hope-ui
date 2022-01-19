import { Box, BoxProps, ElementType } from "..";

export type CenterProps<C extends ElementType> = Omit<BoxProps<C>, "justifyContent" | "alignItems">;

/**
 * Center is a layout component that centers its child within itself.
 *
 * @param props {@link CenterProps}
 */
export function Center<C extends ElementType>(props: CenterProps<C>) {
  return <Box display="flex" justifyContent="center" alignItems="center" {...props} />;
}
