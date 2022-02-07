import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * FormControl
 * -----------------------------------------------------------------------------------------------*/

export const formControlStyles = css({
  position: "relative",
  width: "$full",
});

/* -------------------------------------------------------------------------------------------------
 * FormLabel
 * -----------------------------------------------------------------------------------------------*/

export const formLabelStyles = css({
  display: "inline-block",

  marginBottom: "$1",

  color: "$neutral12",
  fontWeight: "$medium",
  fontSize: "$sm",
  lineHeight: "$5",
  textAlign: "start",

  opacity: 1,

  _disabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
});

/* -------------------------------------------------------------------------------------------------
 * FormHelperText
 * -----------------------------------------------------------------------------------------------*/

export const formHelperTextStyles = css({
  display: "inline-block",

  marginTop: "$1",

  color: "$neutral11",
  fontWeight: "$normal",
  fontSize: "$sm",
  lineHeight: "$5",
  textAlign: "start",

  opacity: 1,

  _disabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
});

/* -------------------------------------------------------------------------------------------------
 * FormErrorMessage
 * -----------------------------------------------------------------------------------------------*/

export const formErrorMessageStyles = css({
  display: "inline-block",

  marginTop: "$1",

  color: "$danger9",
  fontWeight: "$normal",
  fontSize: "$sm",
  lineHeight: "$5",
  textAlign: "start",

  opacity: 1,

  _disabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
});
