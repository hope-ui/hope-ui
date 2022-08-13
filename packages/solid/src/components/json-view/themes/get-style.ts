import { createStitches } from "@stitches/core";
import { Base16Theme } from "./base-16.type";
import * as Themes from "./colors";
import constants from "./style-constants";

const colorMap = (theme: Base16Theme = Themes.JV_DEFAULT) => ({
  backgroundColor: theme.base00,
  ellipsisColor: theme.base09,
  braceColor: theme.base07,
  expandedIcon: theme.base0D,
  collapsedIcon: theme.base0E,
  keyColor: theme.base07,
  arrayKeyColor: theme.base0C,
  objectSize: theme.base04,
  copyToClipboard: theme.base0F,
  copyToClipboardCheck: theme.base0D,
  objectBorder: theme.base02,

  dataTypeBoolean: theme.base0E,
  dataTypeDate: theme.base0D,
  dataTypeFloat: theme.base0B,
  dataTypeFunction: theme.base0D,
  dataTypeInteger: theme.base0F,
  dataTypeString: theme.base09,
  dataTypeNan: theme.base08,
  dataTypeNull: theme.base0A,
  dataTypeUndefined: theme.base05,
  dataTypeRegexp: theme.base0A,
  dataTypeBackground: theme.base02,

  editableVariableEditIcon: theme.base0E,
  editableVariableCancelIcon: theme.base09,
  editableVariableRemoveIcon: theme.base09,
  editableVariableAddIcon: theme.base0E,
  editableVariableCheckIcon: theme.base0E,
  editableVariableBackground: theme.base01,
  editableVariableColor: theme.base0A,
  editableVariableBorder: theme.base07,

  addKeyModalBackground: theme.base05,
  addKeyModalBorder: theme.base04,
  addKeyModalColor: theme.base0A,
  addKeyModalLabelColor: theme.base01,

  validationFailureBackground: theme.base09,
  validationFailureIconColor: theme.base01,
  validationFailureFontColor: theme.base01,
});

const { css, createTheme } = createStitches({
  theme: {
    colors: { ...colorMap(Themes.JV_DEFAULT) },
  },
});

export const appContainer = css({
  fontFamily: constants.globalFontFamily,
  cursor: constants.globalCursor,
  backgroundColor: "$backgroundColor",
  position: "relative",
});

export const elipsis = css({
  fontFamily: constants.globalFontFamily,
  cursor: constants.globalCursor,
  backgroundColor: "$backgroundColor",
  position: "relative",
});
export const functionElipsis = css({
  display: "inline-block",
  color: "$ellipsisColor",
  fontSize: constants.ellipsisFontSize,
  lineHeight: constants.ellipsisLineHeight,
  cursor: constants.ellipsisCursor,
});
export const braceRow = css({
  display: "inline-block",
  cursor: "pointer",
});
export const brace = css({
  display: "inline-block",
  cursor: constants.braceCursor,
  fontWeight: constants.braceFontWeight,
  color: "$braceColor",
});

export const expandedIcon = css({
  color: "$expandedIcon",
});
export const collapsedIcon = css({
  color: "$collapsedIcon",
});
export const colon = css({
  display: "inline-block",
  margin: constants.keyMargin,
  color: "$keyColor",
  verticalAlign: "top",
});

export const objectKeyVal = css({
  variants: {
    border: {
      default: {
        paddingTop: constants.keyValPaddingTop,
        paddingRight: constants.keyValPaddingRight,
        paddingBottom: constants.keyValPaddingBottom,
        borderLeft: constants.keyValBorderLeft + " " + "$objectBorder",
        "&:hover": {
          borderLeft: constants.keyValBorderHover + " " + "$objectBorder",
        },
      },
      noBorder: {
        padding: constants.keyValPaddingTop,
      },
    },
  },
  defaultVariants: {
    border: "default",
  },
});

export const pushedContent = css({
  marginLeft: constants.pushedContentMarginLeft,
});

export const objectName = css({
  display: "inline-block",
  color: "$keyColor",
  letterSpacing: constants.keyLetterSpacing,
  fontStyle: constants.keyFontStyle,
  verticalAlign: constants.keyVerticalAlign,
  opacity: constants.keyOpacity,
  "&:hover": {
    opacity: constants.keyOpacityHover,
  },
});

export const arrayKey = css({
  display: "inline-block",
  color: "$arrayKeyColor",
  letterSpacing: constants.keyLetterSpacing,
  fontStyle: constants.keyFontStyle,
  verticalAlign: constants.keyVerticalAlign,
  opacity: constants.keyOpacity,
  "&:hover": {
    opacity: constants.keyOpacityHover,
  },
});
export const objectSize = css({
  color: "$objectSize",
  borderRadius: constants.objectSizeBorderRadius,
  fontStyle: constants.objectSizeFontStyle,
  margin: constants.objectSizeMargin,
  cursor: "default",
});
export const dataTypeLabel = css({
  fontSize: constants.dataTypeFontSize,
  marginRight: constants.dataTypeMarginRight,
  opacity: constants.datatypeOpacity,
});

export const variableValue = css({
  display: "inline-block",
  paddingRight: constants.variableValuePaddingRight,
  position: "relative",
  variants: {
    dataType: {
      boolean: {
        color: "$dataTypeBoolean",
      },
      date: {
        color: "$dataTypeDate",
        "&>.date-value": {
          marginLeft: constants.dateValueMarginLeft,
        },
      },
      float: {
        display: "inline-block",
        color: "$dataTypeFloat",
      },
      function: {
        display: "inline-block",
        color: "$dataTypeFunction",
        cursor: "pointer",
        whiteSpace: "pre-line",

        "&>.functionValue": {
          fontStyle: "italic",
        },
      },
      integer: {
        display: "inline-block",
        color: "$dataTypeInteger",
      },
      string: {
        display: "inline-block",
        color: "$dataTypeString",
        "&:>.string-value": {
          display: "inline-block",
        },
      },
      nan: {
        display: "inline-block",
        color: "$dataTypeNan",
        fontSize: constants.nanFontSize,
        fontWeight: constants.nanFontWeight,
        backgroundColor: "$dataTypeBackground",
        padding: constants.nanPadding,
        borderRadius: constants.nanBorderRadius,
      },
      null: {
        display: "inline-block",
        color: "$dataTypeNull",
        fontSize: constants.nullFontSize,
        fontWeight: constants.nullFontWeight,
        backgroundColor: "$dataTypeBackground",
        padding: constants.nullPadding,
        borderRadius: constants.nullBorderRadius,
      },
      undefined: {
        display: "inline-block",
        color: "$dataTypeUndefined",
        fontSize: constants.undefinedFontSize,
        fontWeight: constants.undefinedFontWeight,
        backgroundColor: "$dataTypeBackground",
        padding: constants.undefinedPadding,
        borderRadius: constants.undefinedBorderRadius,
      },
      regexp: {
        display: "inline-block",
        color: "$dataTypeRegexp",
      },
    },
  },
  defaultVariants: { dataType: "string" },
});

export const copyToClipboard = css({
  cursor: constants.clipboardCursor,
});

export const copyIcon = css({
  variants: {
    state: {
      default: {
        color: "$copyToClipboard",
        fontSize: constants.iconFontSize,
        marginRight: constants.iconMarginRight,
        verticalAlign: "top",
      },
      copied: {
        color: "$copyToClipboardCheck",
        marginLeft: constants.clipboardCheckMarginLeft,
      },
    },
  },
  defaultVariants: {
    state: "default",
  },
});

export const metaData = css({
  display: "inline-block",
  variants: {
    dataType: {
      arrayGroup: {
        padding: constants.arrayGroupMetaPadding,
      },
      object: {
        padding: constants.metaDataPadding,
      },
    },
  },
});

export const iconContainer = css({
  display: "inline-block",
  width: constants.iconContainerWidth,
});

export const varIcon = css({
  verticalAlign: "top",
  display: "inline-block",
  cursor: constants.iconCursor,
  fontSize: constants.iconFontSize,
  marginRight: constants.iconMarginRight,

  variants: {
    color: {
      remove: {
        color: "$editableVariableRemoveIcon",
      },
      add: {
        color: "$editableVariableAddIcon",
      },
      edit: {
        color: "$editableVariableEditIcon",
      },
      check: {
        color: "$editableVariableCheckIcon",
      },
      cancel: {
        color: "$editableVariableCancelIcon",
      },
    },
  },
});

export const toolTip = css({
  padding: constants.tooltipPadding,
});

export const editInput = css({
  display: "inline-block",
  minWidth: constants.editInputMinWidth,
  borderRadius: constants.editInputBorderRadius,
  backgroundColor: "$editableVariableBackground",
  color: "$editableVariableColor",
  padding: constants.editInputPadding,
  marginRight: constants.editInputMarginRight,
  fontFamily: constants.editInputFontFamily,
});

export const detectedRow = css({
  paddingTop: constants.detectedRowPaddingTop,
});

export const keyModal = css({
  width: constants.addKeyModalWidth,
  backgroundColor: "$addKeyModalBackground",
  marginLeft: constants.addKeyModalMargin,
  marginRight: constants.addKeyModalMargin,
  padding: constants.addKeyModalPadding,
  borderRadius: constants.addKeyModalRadius,
  marginTop: "15px",
  position: "relative",
});

export const keyModalRequest = css({
  position: constants.addKeyCoverPosition,
  top: constants.addKeyCoverPositionPx,
  left: constants.addKeyCoverPositionPx,
  right: constants.addKeyCoverPositionPx,
  bottom: constants.addKeyCoverPositionPx,
  backgroundColor: constants.addKeyCoverBackground,
});

export const keyModalLabel = css({
  color: "$addKeyModalLabelColor",
  marginLeft: "2px",
  marginBottom: "5px",
  fontSize: "11px",
});

export const keyModalInput = css({
  width: "100%",
  padding: "3px 6px",
  fontFamily: "monospace",
  color: "$addKeyModalColor",
  border: "none",
  boxSizing: "border-box",
  borderRadius: "2px",
});

export const keyModalCancel = css({
  backgroundColor: "$editableVariableRemoveIcon",
  position: "absolute",
  top: "0px",
  right: "0px",
  borderRadius: "0px 3px 0px 3px",
  cursor: "pointer",
});

export const keyModalCancelIcon = css({
  color: "$addKeyModalLabelColor",
  fontSize: constants.iconFontSize,
  transform: "rotate(45deg)",
});

export const keyModalSubmit = css({
  color: "$editableVariableAddIcon",
  fontSize: constants.iconFontSize,
  position: "absolute",
  right: "2px",
  top: "3px",
  cursor: "pointer",
});

export const validationFailure = css({
  float: "right",
  padding: "3px 6px",
  borderRadius: "2px",
  cursor: "pointer",
  color: "$validationFailureFontColor",
  backgroundColor: "$validationFailureBackground",
});

export const validationFailureClear = css({
  position: "relative",
  verticalAlign: "top",
  cursor: "pointer",
  color: "$validationFailureIconColor",
  fontSize: constants.iconFontSize,
  transform: "rotate(45deg)",
});

export const setTheme = (theme: Base16Theme | string | undefined) => {
  let themeName = "default";
  if (typeof theme === "string") {
    themeName = theme;
    const colorTheme = (Themes as any)[theme] as Base16Theme;
    return createTheme(themeName, {
      colors: { ...colorMap(colorTheme) },
    });
  } else {
    themeName = "custom-theme";
    const colorTheme = theme;
    return createTheme(themeName, {
      colors: { ...colorMap(colorTheme) },
    });
  }
};
