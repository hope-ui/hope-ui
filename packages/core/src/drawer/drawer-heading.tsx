import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

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

  createEffect(() => {
    drawerContext.setHeadingId(`${drawerContext.contentId()}-heading`);
    onCleanup(() => drawerContext.setHeadingId(undefined));
  });

  return (
    <hope.h2
      id={drawerContext.headingId()}
      class={clsx(drawerContext.baseClasses().heading, local.class)}
      __css={drawerContext.styleOverrides().heading}
      {...others}
    />
  );
});
