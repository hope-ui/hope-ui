/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/spacer.tsx
 */

import { hope } from "@hope-ui/styles";

import { spacerStyles } from "./spacer.css";

/**
 * A flexible flex spacer that expands along the major axis of its containing flex layout.
 * It renders a `div` by default, and takes up any available space.
 */
export const Spacer = hope(
  "div",
  {
    baseStyle: {
      __staticClass: spacerStyles.root,
    },
  },
  "hope-Spacer-root"
);
