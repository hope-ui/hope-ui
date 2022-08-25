/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/spacer.tsx
 */

import { createHopeComponent, createStyles, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

const useStyles = createStyles({
  base: {
    flex: 1,
    justifySelf: "stretch",
    alignSelf: "stretch",
  },
});

/**
 * A flexible flex spacer that expands along the major axis of its containing flex layout.
 * It renders a `div` by default, and takes up any available space.
 */
export const Spacer = createHopeComponent<"div">(props => {
  const [local, others] = splitProps(props, ["class"]);

  const className = useStyles();

  return <hope.div class={clsx("hope-Spacer-root", className(), local.class)} {...others} />;
});
