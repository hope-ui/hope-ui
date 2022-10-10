import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

import { DrawerParts } from "./drawer.styles";
import { useDrawerContext } from "./drawer-context";

/**
 * `DrawerHeading` renders a heading in a drawer dialog.
 * This component must be wrapped with `Drawer`,
 * so the `aria-labelledby` prop is properly set on the drawer dialog element.
 *
 * It renders an `h2` by default.
 */
export const DrawerHeading = createHopeComponent<"h2">(props => {
  const drawerContext = useDrawerContext();

  const [local, others] = splitProps(props, ["class"]);

  const { baseClasses, styleOverrides } = useStyleConfigContext<DrawerParts>();

  createEffect(() => {
    drawerContext.setHeadingId(`${drawerContext.contentId()}-heading`);
    onCleanup(() => drawerContext.setHeadingId(undefined));
  });

  return (
    <hope.h2
      id={drawerContext.headingId()}
      class={clsx(baseClasses().heading, local.class)}
      __css={styleOverrides().heading}
      {...others}
    />
  );
});
