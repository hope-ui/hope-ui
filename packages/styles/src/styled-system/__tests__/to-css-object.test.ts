import { DEFAULT_THEME } from "../../theme";
import { ThemeBase } from "../../types";
import { toCSSObject } from "../to-css-object";

describe("toCSSObject", () => {
  it("should returns system props styles", () => {
    const result = toCSSObject(
      {
        color: "primary.500",
        fontSize: ["base", "lg", "xl"],
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "@media screen and (min-width: 640px)": Object {
        "fontSize": "${DEFAULT_THEME.fontSizes.lg}",
      },
      "@media screen and (min-width: 768px)": Object {
        "fontSize": "${DEFAULT_THEME.fontSizes.xl}",
      },
      "color": "${DEFAULT_THEME.colors.primary["500"]}",
      "fontSize": "${DEFAULT_THEME.fontSizes.base}",
    }
  `);
  });

  it("should  returns nested system props styles", () => {
    const result = toCSSObject(
      {
        color: "primary.500",
        "&:hover": {
          color: "primary.600",
        },
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "&:hover": Object {
        "color": "${DEFAULT_THEME.colors.primary["600"]}",
      },
      "color": "${DEFAULT_THEME.colors.primary["500"]}",
    }
  `);
  });

  it("should returns nested responsive styles", () => {
    const result = toCSSObject(
      {
        color: "primary.500",
        h1: {
          py: [3, 4],
        },
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "color": "${DEFAULT_THEME.colors.primary["500"]}",
      "h1": Object {
        "@media screen and (min-width: 640px)": Object {
          "paddingBottom": "${DEFAULT_THEME.space["4"]}",
          "paddingTop": "${DEFAULT_THEME.space["4"]}",
        },
        "paddingBottom": "${DEFAULT_THEME.space["3"]}",
        "paddingTop": "${DEFAULT_THEME.space["3"]}",
      },
    }
  `);
  });

  it("should handles all core styled system props", () => {
    const result = toCSSObject(
      {
        m: 0,
        mb: 2,
        mx: "auto",
        p: 3,
        py: 4,
        fontSize: "lg",
        fontWeight: "bold",
        color: "primary.500",
        bg: "primary.50",
        fontFamily: "mono",
        lineHeight: "base",
        textTransform: "uppercase",
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "background": "${DEFAULT_THEME.colors.primary["50"]}",
      "color": "${DEFAULT_THEME.colors.primary["500"]}",
      "fontFamily": "${DEFAULT_THEME.fonts.mono}",
      "fontSize": "${DEFAULT_THEME.fontSizes.lg}",
      "fontWeight": ${DEFAULT_THEME.fontWeights.bold},
      "lineHeight": ${DEFAULT_THEME.lineHeights.base},
      "margin": "0px",
      "marginBottom": "${DEFAULT_THEME.space["2"]}",
      "marginInlineEnd": "auto",
      "marginInlineStart": "auto",
      "padding": "${DEFAULT_THEME.space["3"]}",
      "paddingBottom": "${DEFAULT_THEME.space["4"]}",
      "paddingTop": "${DEFAULT_THEME.space["4"]}",
      "textTransform": "uppercase",
    }
  `);
  });

  it("supports functional values", () => {
    const result = toCSSObject(
      {
        color: (theme: ThemeBase) => theme.colors.primary["500"],
      },
      DEFAULT_THEME
    );

    expect(result).toEqual({
      color: DEFAULT_THEME.colors.primary["500"],
    });
  });

  it("should skip breakpoints", () => {
    const result = toCSSObject(
      {
        width: ["100%", null, "50%"],
      },
      DEFAULT_THEME
    );

    expect(result).toEqual({
      width: "100%",
      "@media screen and (min-width: 640px)": {},
      "@media screen and (min-width: 768px)": {
        width: "50%",
      },
    });
  });

  it("padding shorthand does not collide with nested p selector", () => {
    const result = toCSSObject(
      {
        p: {
          fontSize: 32,
          color: "tomato",
          p: 2,
        },
        padding: 32,
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "p": Object {
        "color": "tomato",
        "fontSize": "32px",
        "padding": "${DEFAULT_THEME.space["2"]}",
      },
      "padding": "${DEFAULT_THEME.space["32"]}",
    }
  `);
  });

  it("functional values can return responsive arrays", () => {
    const result = toCSSObject(
      {
        color: (theme: ThemeBase) => [theme.colors.primary["500"], theme.colors.primary["600"]],
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "@media screen and (min-width: 640px)": Object {
        "color": "${DEFAULT_THEME.colors.primary["600"]}",
      },
      "color": "${DEFAULT_THEME.colors.primary["500"]}",
    }
  `);
  });

  it("should resolves color correctly", () => {
    const result = toCSSObject(
      {
        color: "primary.500",
      },
      DEFAULT_THEME
    );

    expect(result).toEqual({
      color: DEFAULT_THEME.colors.primary["500"],
    });
  });

  it("should returns individual border styles", () => {
    const result = toCSSObject(
      {
        borderTopWidth: "2px",
        borderTopColor: "primary.500",
        borderTopStyle: "solid",
        borderTopLeftRadius: "sm",
        borderTopRightRadius: "sm",
        borderBottomWidth: "2px",
        borderBottomColor: "primary.500",
        borderBottomStyle: "solid",
        borderBottomLeftRadius: "sm",
        borderBottomRightRadius: "sm",
        borderRightWidth: "2px",
        borderRightColor: "primary.500",
        borderRightStyle: "solid",
        borderLeftWidth: "2px",
        borderLeftColor: "primary.500",
        borderLeftStyle: "solid",
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "borderBottomColor": "${DEFAULT_THEME.colors.primary["500"]}",
      "borderBottomLeftRadius": "${DEFAULT_THEME.radii.sm}",
      "borderBottomRightRadius": "${DEFAULT_THEME.radii.sm}",
      "borderBottomStyle": "solid",
      "borderBottomWidth": "2px",
      "borderLeftColor": "${DEFAULT_THEME.colors.primary["500"]}",
      "borderLeftStyle": "solid",
      "borderLeftWidth": "2px",
      "borderRightColor": "${DEFAULT_THEME.colors.primary["500"]}",
      "borderRightStyle": "solid",
      "borderRightWidth": "2px",
      "borderTopColor": "${DEFAULT_THEME.colors.primary["500"]}",
      "borderTopLeftRadius": "${DEFAULT_THEME.radii.sm}",
      "borderTopRightRadius": "${DEFAULT_THEME.radii.sm}",
      "borderTopStyle": "solid",
      "borderTopWidth": "2px",
    }
  `);
  });

  it("should uses theme.sizes for flexBasis", () => {
    const style = toCSSObject(
      {
        flexBasis: "4",
      },
      DEFAULT_THEME
    );
    expect(style).toMatchInlineSnapshot(`
    Object {
      "flexBasis": "${DEFAULT_THEME.sizes["4"]}",
    }
  `);
  });

  it("should transformed multiples", () => {
    const style = toCSSObject(
      {
        mx: 2,
        my: 2,
        px: 2,
        py: 2,
        width: "sm",
      },
      DEFAULT_THEME
    );

    expect(style).toMatchInlineSnapshot(`
    Object {
      "marginBottom": "${DEFAULT_THEME.space["2"]}",
      "marginInlineEnd": "${DEFAULT_THEME.space["2"]}",
      "marginInlineStart": "${DEFAULT_THEME.space["2"]}",
      "marginTop": "${DEFAULT_THEME.space["2"]}",
      "paddingBottom": "${DEFAULT_THEME.space["2"]}",
      "paddingInlineEnd": "${DEFAULT_THEME.space["2"]}",
      "paddingInlineStart": "${DEFAULT_THEME.space["2"]}",
      "paddingTop": "${DEFAULT_THEME.space["2"]}",
      "width": "${DEFAULT_THEME.sizes.sm}",
    }
  `);
  });

  it("should returns outline color from theme", () => {
    const result = toCSSObject(
      {
        outlineColor: "primary.500",
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "outlineColor": "${DEFAULT_THEME.colors.primary["500"]}",
    }
  `);
  });

  it("should returns correct media query order", () => {
    const result = toCSSObject(
      {
        width: ["100%", null, "50%"],
        color: ["primary.50", "primary.100", "primary.200"],
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "@media screen and (min-width: 640px)": Object {
        "color": "${DEFAULT_THEME.colors.primary["100"]}",
      },
      "@media screen and (min-width: 768px)": Object {
        "color": "${DEFAULT_THEME.colors.primary["200"]}",
        "width": "50%",
      },
      "color": "${DEFAULT_THEME.colors.primary["50"]}",
      "width": "100%",
    }
  `);
  });

  it("should returns correct media query 2nd order", () => {
    const result = toCSSObject(
      {
        flexDirection: "column",
        justifyContent: [null, "flex-start", "flex-end"],
        color: "primary.500",
        height: "100%",
        px: [2, 3, 4],
        py: 4,
      },
      DEFAULT_THEME
    );

    const keys = Object.keys(result);

    expect(keys).toMatchInlineSnapshot(`
    Array [
      "flexDirection",
      "color",
      "height",
      "paddingInlineStart",
      "paddingInlineEnd",
      "paddingTop",
      "paddingBottom",
      "@media screen and (min-width: 640px)",
      "@media screen and (min-width: 768px)",
    ]
  `);
  });

  it("should transforms pseudo selectors", () => {
    const result = toCSSObject(
      {
        _before: {
          paddingBottom: 2,
          paddingLeft: [2, 3, 4],
          paddingRight: { base: 1, sm: 2 },
        },
      },
      DEFAULT_THEME
    );

    expect(result).toMatchInlineSnapshot(`
    Object {
      "&::before": Object {
        "@media screen and (min-width: 640px)": Object {
          "paddingLeft": "${DEFAULT_THEME.space["3"]}",
          "paddingRight": "${DEFAULT_THEME.space["2"]}",
        },
        "@media screen and (min-width: 768px)": Object {
          "paddingLeft": "${DEFAULT_THEME.space["4"]}",
        },
        "paddingBottom": "${DEFAULT_THEME.space["2"]}",
        "paddingLeft": "${DEFAULT_THEME.space["2"]}",
        "paddingRight": "${DEFAULT_THEME.space["1"]}",
      },
    }
  `);
  });
});
