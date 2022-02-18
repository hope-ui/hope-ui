import { VariantProps } from "@stitches/core";

import { css } from "@/styled-system/stitches.config";

/* -------------------------------------------------------------------------------------------------
 * Table
 * -----------------------------------------------------------------------------------------------*/

export const tableStyles = css({
  width: "100%",
  borderCollapse: "collapse",
  fontVariantNumeric: "lining-nums tabular-nums",
});

/* -------------------------------------------------------------------------------------------------
 * Table - caption
 * -----------------------------------------------------------------------------------------------*/

export const tableCaptionStyles = css({
  px: "$6",
  py: "$4",

  color: "$neutral11",
  fontSize: "$sm",
  fontWeight: "$medium",
  lineHeight: "$5",
  textAlign: "center",

  variants: {
    dense: {
      true: {
        px: "$4",
        py: "$3",
        fontSize: "$xs",
        lineHeight: "$4",
      },
    },
    placement: {
      top: {
        captionSide: "top",
      },
      bottom: {
        captionSide: "bottom",
      },
    },
  },
});

export type TableCaptionVariants = VariantProps<typeof tableCaptionStyles>;

/* -------------------------------------------------------------------------------------------------
 * Table - thead
 * -----------------------------------------------------------------------------------------------*/

export const tableHeadStyles = css({
  backgroundColor: "$neutral3",
});

/* -------------------------------------------------------------------------------------------------
 * Table - tbody
 * -----------------------------------------------------------------------------------------------*/

export const tableBodyStyles = css({
  variants: {
    striped: {
      true: {
        "& td": {
          borderBottomWidth: 0,
        },
        "& tr:last-of-type td": {
          borderBottomWidth: "1px",
        },
        "& tr:nth-of-type(even) td": {
          backgroundColor: "$neutral3",
        },
      },
    },
    highlightOnHover: {
      true: {
        "& tr:hover td": {
          backgroundColor: "$neutral4",
        },
      },
    },
  },
  compoundVariants: [
    {
      striped: true,
      highlightOnHover: true,
      css: {
        "& tr:nth-of-type(even):hover td": {
          backgroundColor: "$neutral4",
        },
      },
    },
  ],
});

/* -------------------------------------------------------------------------------------------------
 * Table - tfoot
 * -----------------------------------------------------------------------------------------------*/

export const tableFootStyles = css({
  backgroundColor: "$neutral3",

  "& tr:last-of-type th": {
    borderBottomWidth: 0,
  },
});

/* -------------------------------------------------------------------------------------------------
 * Table - th
 * -----------------------------------------------------------------------------------------------*/

export const tableColumnHeaderStyles = css({
  borderBottom: "1px solid $colors$neutral6",

  px: "$6",
  py: "$3",

  color: "$neutral11",
  fontSize: "$xs",
  fontWeight: "$semibold",
  lineHeight: "$4",
  letterSpacing: "$wider",
  textAlign: "start",
  textTransform: "uppercase",

  variants: {
    dense: {
      true: {
        px: "$4",
        py: "$1",
      },
    },
    numeric: {
      true: {
        textAlign: "end",
      },
    },
  },
});

export type TableColumnHeaderVariants = VariantProps<typeof tableColumnHeaderStyles>;

/* -------------------------------------------------------------------------------------------------
 * Table - td
 * -----------------------------------------------------------------------------------------------*/

export const tableCellStyles = css({
  borderBottom: "1px solid $colors$neutral6",

  px: "$6",
  py: "$4",

  fontSize: "$base",
  lineHeight: "$6",
  textAlign: "start",

  transition: "background-color 250ms",

  variants: {
    dense: {
      true: {
        px: "$4",
        py: "$2",
        fontSize: "$sm",
        lineHeight: "$5",
      },
    },
    numeric: {
      true: {
        textAlign: "end",
      },
    },
  },
});

export type TableCellVariants = VariantProps<typeof tableCellStyles>;
