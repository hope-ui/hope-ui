import { VariantProps } from "@stitches/core";

import { css } from "../../styled-system/stitches.config";
import { toggleContainerStyles, toggleControlLabelStyles, toggleControlStyles } from "../checkbox/checkbox.styles";

/* -------------------------------------------------------------------------------------------------
 * Radio - container
 * -----------------------------------------------------------------------------------------------*/

export const radioContainerStyles = css(toggleContainerStyles);

/* -------------------------------------------------------------------------------------------------
 * Radio - label
 * -----------------------------------------------------------------------------------------------*/

export const radioLabelStyles = css(toggleControlLabelStyles);

/* -------------------------------------------------------------------------------------------------
 * Radio - control
 * -----------------------------------------------------------------------------------------------*/

export const radioControlStyles = css(toggleControlStyles, {
  borderRadius: "$full",

  "&[data-checked]::before": {
    content: "",
    display: "inline-block",
    position: "relative",
    boxSize: "calc(50% + 1px)", // beacause of the 1px border
    borderRadius: "$full",
    backgroundColor: "$loContrast",
  },
});

export type RadioControlVariants = VariantProps<typeof radioControlStyles>;
