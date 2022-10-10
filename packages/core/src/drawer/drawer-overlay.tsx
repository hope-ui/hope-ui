import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Accessor, createMemo, JSX, splitProps } from "solid-js";

import { DrawerParts } from "./drawer.styles";
import { useDrawerContext } from "./drawer-context";

export interface DrawerOverlayProps {
  /** The css style attribute (should be an object). */
  style?: JSX.CSSProperties;
}

/**
 * `DrawerOverlay` renders a backdrop that is typically displayed behind a drawer.
 */
export const DrawerOverlay = createHopeComponent<"div", DrawerOverlayProps>(props => {
  const drawerContext = useDrawerContext();

  const { baseClasses, styleOverrides } = useStyleConfigContext<DrawerParts>();

  const [local, others] = splitProps(props, ["class", "style", "children"]);

  const computedStyle: Accessor<JSX.CSSProperties> = createMemo(() => ({
    ...local.style,
    ...drawerContext.overlayTransition.style(),
  }));

  return (
    <hope.div
      role="presentation"
      class={clsx(baseClasses().overlay, local.class)}
      style={computedStyle()}
      __css={styleOverrides().overlay}
      {...others}
    />
  );
});
