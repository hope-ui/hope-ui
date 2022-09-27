import { TransitionStyles } from "@hope-ui/primitives";

import { DrawerVariants } from "./drawer.styles";

export const DRAWER_TRANSITION: Record<DrawerVariants["placement"], TransitionStyles> = {
  top: {
    in: { transform: "translateY(0)" },
    out: { transform: "translateY(-100%)" },
  },
  right: {
    in: { transform: "translateX(0)" },
    out: { transform: "translateX(100%)" },
  },
  bottom: {
    in: { transform: "translateY(0)" },
    out: { transform: "translateY(100%)" },
  },
  left: {
    in: { transform: "translateX(0)" },
    out: { transform: "translateX(-100%)" },
  },
};
