import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createEffect, onCleanup, splitProps } from "solid-js";

import { DrawerParts } from "./drawer.styles";
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

  const { baseClasses, styleOverrides } = useStyleConfigContext<DrawerParts>();

  createEffect(() => {
    drawerContext.setDescriptionId(`${drawerContext.contentId()}-description`);
    onCleanup(() => drawerContext.setDescriptionId(undefined));
  });

  return (
    <hope.p
      id={drawerContext.descriptionId()}
      class={clsx(baseClasses().description, local.class)}
      __css={styleOverrides().description}
      {...others}
    />
  );
});
