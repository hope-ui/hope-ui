import { createStyles } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * FormControl
 * -----------------------------------------------------------------------------------------------*/

export const formControlStyles = createStyles({
  position: "relative",
  width: "$full",
});

/* -------------------------------------------------------------------------------------------------
 * FormLabel
 * -----------------------------------------------------------------------------------------------*/

export const formLabelStyles = createStyles({
  display: "inline-block",

  marginBottom: "$1",

  color: "$neutral12",
  fontWeight: "$medium",
  fontSize: "$sm",
  lineHeight: "$5",
  textAlign: "start",

  opacity: 1,

  "&[data-disabled]": {
    opacity: 0.4,
    cursor: "not-allowed",
  },
});

export const requiredIndicatorStyles = createStyles({
  marginInlineStart: "$1",
  color: "$danger9",
  fontSize: "$base",
});

/* -------------------------------------------------------------------------------------------------
 * FormHelperText
 * -----------------------------------------------------------------------------------------------*/

export const formHelperTextStyles = createStyles({
  display: "inline-block",

  marginTop: "$1",

  color: "$neutral11",
  fontWeight: "$normal",
  fontSize: "$sm",
  lineHeight: "$5",
  textAlign: "start",

  opacity: 1,

  "&[data-disabled]": {
    opacity: 0.4,
    cursor: "not-allowed",
  },
});

/* -------------------------------------------------------------------------------------------------
 * FormErrorMessage
 * -----------------------------------------------------------------------------------------------*/

export const formErrorMessageStyles = createStyles({
  display: "inline-block",

  marginTop: "$1",

  color: "$danger9",
  fontWeight: "$normal",
  fontSize: "$sm",
  lineHeight: "$5",
  textAlign: "start",

  opacity: 1,

  "&[data-disabled]": {
    opacity: 0.4,
    cursor: "not-allowed",
  },
});
