/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/layout/src/center.tsx
 */

import { hope } from "@hope-ui/styles";

import { centerStyles } from "./center.css";

/**
 * `Center` is used to horizontally and vertically center its child.
 * It uses the popular `display: flex` centering technique.
 */
export const Center = hope(
  "div",
  {
    baseStyle: {
      __staticClass: centerStyles.root,
    },
  },
  "hope-Center-root"
);
