/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/center.tsx
 */

import { createHopeComponent, createStyles, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

const useStyles = createStyles({
  root: {
    base: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
});

/**
 * `Center` is used to horizontally and vertically center its child.
 * It uses the popular `display: flex` centering technique.
 */
export const Center = createHopeComponent<"div">(props => {
  const [local, others] = splitProps(props, ["class"]);

  const classes = useStyles();

  return <hope.div class={clsx("hope-Center-root", classes().root, local.class)} {...others} />;
});
