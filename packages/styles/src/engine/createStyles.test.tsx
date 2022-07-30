import { Component } from "solid-js";
import { render, screen } from "solid-testing-library";

import { DEFAULT_THEME, ThemeProvider } from "../theme";
import { CSSObject } from "../types";
import { createStyles } from "./createStyles";

function expectStyles(Example: Component, styles: CSSObject) {
  render(() => <Example />);

  expect(screen.getByText("test-element")).toHaveStyle(styles);
}

const objectStyles = createStyles({
  testObject: { backgroundColor: "#FEF67F" },
});

const functionStyles = createStyles(() => ({
  testFunction: { borderColor: "#CE5634" },
}));

const themeStyles = createStyles(theme => ({
  testTheme: { fontSize: theme.fontSizes.xl },
}));

const paramsStyles = createStyles((_theme, params: { radius: number }) => ({
  testParams: { borderRadius: params.radius },
}));

const getRefStyles = createStyles((_theme, _params, getRef) => ({
  overrideRef: { ref: getRef("override") },
  testRef: {
    backgroundColor: "red",

    [`&.${getRef("override")}`]: {
      backgroundColor: "blue",
    },
  },
}));

function NamedContainer(props: { classNames?: any; styles?: any }) {
  const { classes } = objectStyles(undefined, {
    name: "NamedComponent",
    get classNames() {
      return props.classNames;
    },
    get styles() {
      return props.styles;
    },
  });
  return <div class={classes().testObject}>test-element</div>;
}

function MultipleNames(props: { classNames?: any; styles?: any }) {
  const { classes } = objectStyles(undefined, {
    name: ["NamedComponent", "TestName"],
    get classNames() {
      return props.classNames;
    },
    get styles() {
      return props.styles;
    },
  });
  return <div class={classes().testObject}>test-element</div>;
}

describe("createStyles", () => {
  it("assigns styles with css object", () => {
    expectStyles(() => <div class={objectStyles().classes().testObject}>test-element</div>, {
      backgroundColor: "#FEF67F",
    });
  });

  it("assigns styles with function", () => {
    expectStyles(() => <div class={functionStyles().classes().testFunction}>test-element</div>, {
      borderColor: "#CE5634",
    });
  });

  it("supports getting theme as first argument", () => {
    expectStyles(() => <div class={themeStyles().classes().testTheme}>test-element</div>, {
      fontSize: `${DEFAULT_THEME.fontSizes.xl}px`,
    });
  });

  it("supports getting params as second argument", () => {
    expectStyles(
      () => <div class={paramsStyles({ radius: 432 }).classes().testParams}>test-element</div>,
      { borderRadius: "432px" }
    );
  });

  it("allows to merge styles with cx function", () => {
    expectStyles(
      () => {
        const { classes, cx } = objectStyles();
        return (
          <div class={cx(functionStyles().classes().testFunction, classes().testObject)}>
            test-element
          </div>
        );
      },
      { backgroundColor: "#FEF67F", borderColor: "#CE5634" }
    );
  });

  it("allows to override styles with getRef function", () => {
    expectStyles(
      () => {
        const { classes, cx } = getRefStyles();
        return <div class={cx(classes().testRef, classes().overrideRef)}>test-element</div>;
      },
      { backgroundColor: "blue" }
    );
  });

  it("generates name based on name param", () => {
    render(() => <NamedContainer />);
    expect(screen.getByText("test-element")).toHaveClass("hope-NamedComponent-testObject");
  });

  it("assigns given classNames", () => {
    render(() => <NamedContainer classNames={{ testObject: "secret-class" }} />);
    expect(screen.getByText("test-element")).toHaveClass("secret-class");
  });

  it("adds given styles with object syntax", () => {
    render(() => <NamedContainer styles={{ testObject: { outline: "2px solid red" } }} />);
    expect(screen.getByText("test-element")).toHaveStyle({ outline: "2px solid red" });
  });

  it("adds given styles with function syntax", () => {
    render(() => (
      <NamedContainer styles={(theme: any) => ({ testObject: { fontSize: theme.fontSizes.xs } })} />
    ));

    expect(screen.getByText("test-element")).toHaveStyle({
      fontSize: `${DEFAULT_THEME.fontSizes.xs}px`,
    });
  });

  it("assigns classNames from ThemeProvider", () => {
    render(() => (
      <ThemeProvider
        theme={{
          components: {
            NamedComponent: {
              classNames: { testObject: "provider-class" },
            },
          },
        }}
      >
        <NamedContainer classNames={{ testObject: "local-class" }} />
      </ThemeProvider>
    ));

    expect(screen.getByText("test-element")).toHaveClass("provider-class");
    expect(screen.getByText("test-element")).toHaveClass("local-class");
  });

  it("assigns styles from ThemeProvider (object)", () => {
    render(() => (
      <ThemeProvider
        theme={{
          components: {
            NamedComponent: {
              styles: { testObject: { background: "#EF56ED" } },
            },
          },
        }}
      >
        <NamedContainer styles={{ testObject: { color: "cyan" } }} />
      </ThemeProvider>
    ));

    expect(screen.getByText("test-element")).toHaveStyle({ background: "#EF56ED", color: "cyan" });
  });

  it("assigns styles from ThemeProvider (function)", () => {
    render(() => (
      <ThemeProvider
        theme={{
          components: {
            NamedComponent: {
              styles: theme => ({ testObject: { fontSize: theme.fontSizes.sm } }),
            },
          },
        }}
      >
        <NamedContainer styles={{ testObject: { color: "cyan" } }} />
      </ThemeProvider>
    ));

    expect(screen.getByText("test-element")).toHaveStyle({
      fontSize: `${DEFAULT_THEME.fontSizes.sm}px`,
      color: "cyan",
    });
  });

  it("adds correct static selectors for multiple names", () => {
    render(() => <MultipleNames />);

    expect(screen.getByText("test-element")).toHaveClass("hope-NamedComponent-testObject");
    expect(screen.getByText("test-element")).toHaveClass("hope-TestName-testObject");
  });

  it("supports ThemeProvider classNames for multiple names", () => {
    render(() => (
      <ThemeProvider
        theme={{
          components: {
            NamedComponent: {
              classNames: { testObject: "named-class" },
            },

            TestName: {
              classNames: { testObject: "test-class" },
            },
          },
        }}
      >
        <MultipleNames classNames={{ testObject: "local-class" }} />
      </ThemeProvider>
    ));

    expect(screen.getByText("test-element")).toHaveClass("named-class");
    expect(screen.getByText("test-element")).toHaveClass("test-class");
    expect(screen.getByText("test-element")).toHaveClass("local-class");
  });

  it("supports ThemeProvider styles object for multiple names", () => {
    render(() => (
      <ThemeProvider
        theme={{
          components: {
            NamedComponent: {
              styles: { testObject: { background: "#EFFF79" } },
            },

            TestName: {
              styles: { testObject: { color: "#661188" } },
            },
          },
        }}
      >
        <MultipleNames styles={{ testObject: { fontSize: "12%" } }} />
      </ThemeProvider>
    ));

    expect(screen.getByText("test-element")).toHaveStyle({
      background: "#EFFF79",
      color: "#661188",
      fontSize: "12%",
    });
  });
});
