import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

import { useDrawerContext } from "./drawer-context";

/**
 * `DrawerDescription` renders a description in a drawer dialog.
 * This component must be wrapped with `Drawer`,
 * so the `aria-describedby` prop is properly set on the drawer dialog element.
 *
 * It renders a `p` by default.
 */
export const DrawerDescription = createHopeComponent<"p">(props => {
  const drawerContext = useDrawerContext();

  const [local, others] = splitProps(props, ["class"]);

  createEffect(() => {
    drawerContext.setDescriptionId(`${drawerContext.contentId()}-description`);
    onCleanup(() => drawerContext.setDescriptionId(undefined));
  });

  return (
    <hope.p
      id={drawerContext.descriptionId()}
      class={clsx(drawerContext.baseClasses().description, local.class)}
      __css={drawerContext.styleOverrides().description}
      {...others}
    />
  );
});
