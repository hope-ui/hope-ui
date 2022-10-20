import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { Accessor, createMemo, JSX, splitProps } from "solid-js";

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

  const [local, others] = splitProps(props, ["class", "style", "children"]);

  const computedStyle: Accessor<JSX.CSSProperties> = createMemo(() => ({
    ...local.style,
    ...drawerContext.overlayTransition.style(),
  }));

  return (
    <hope.div
      role="presentation"
      class={clsx(drawerContext.baseClasses().overlay, local.class)}
      style={computedStyle()}
      __css={drawerContext.styleOverrides().overlay}
      {...others}
    />
  );
});
