import { VariantProps } from "@stitches/core";

import { css } from "@/theme/stitches.config";
import { utilityStyles } from "@/theme/utilityStyles";

import { baseFlexStyles, commonFlexboxAndGridStyles } from "../Flex/Flex.styles";
import { baseTextStyles } from "../Text/Text.styles";

export const boxStyles = css(
  utilityStyles,
  commonFlexboxAndGridStyles,
  baseFlexStyles,
  baseTextStyles,
  {
    variants: {
      display: {
        none: { display: "none" },
        inline: { display: "inline" },
        block: { display: "block" },
        "inline-block": { display: "inline-block" },
        flex: { display: "flex" },
        "inline-flex": { display: "inline-flex" },
        grid: { display: "grid" },
        "inline-grid": { display: "inline-grid" },
      },
    },
  }
);

export type BoxVariants = VariantProps<typeof boxStyles>;
