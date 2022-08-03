import { clsx } from "clsx";
import { Component } from "solid-js";
import { render, screen } from "solid-testing-library";

import { CSSObject } from "../src";
import { createStyles } from "../src/create-styles";
import { DEFAULT_THEME, ThemeProvider } from "../src/theme";

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
  overrideRef: { __staticClass: getRef("override") },
  testRef: {
    backgroundColor: "red",

    [`&.${getRef("override")}`]: {
      backgroundColor: "blue",
    },
  },
}));

function NamedContainer(props: { classNames?: any; styles?: any }) {
  const classes = objectStyles(undefined, {
    name: "NamedComponent",
    classNames: () => props.classNames,
    styles: () => props.styles,
  });
  return <div class={classes().testObject}>test-element</div>;
}

function MultipleNames(props: { classNames?: any; styles?: any }) {
  const classes = objectStyles(undefined, {
    name: ["NamedComponent", "TestName"],
    classNames: () => props.classNames,
    styles: () => props.styles,
  });
  return <div class={classes().testObject}>test-element</div>;
}

describe("createStyles", () => {
  it("assigns styles with css object", () => {
    const classes = objectStyles();

    expectStyles(() => <div class={classes().testObject}>test-element</div>, {
      backgroundColor: "#FEF67F",
    });
  });

  it("assigns styles with function", () => {
    const classes = functionStyles();

    expectStyles(() => <div class={classes().testFunction}>test-element</div>, {
      borderColor: "#CE5634",
    });
  });

  it("supports getting theme as first argument", () => {
    const classes = themeStyles();

    expectStyles(() => <div class={classes().testTheme}>test-element</div>, {
      fontSize: DEFAULT_THEME.fontSizes.xl,
    });
  });

  it("supports getting params as second argument", () => {
    const classes = paramsStyles({ radius: 432 });

    expectStyles(() => <div class={classes().testParams}>test-element</div>, {
      borderRadius: "432px",
    });
  });

  it("allows to merge styles with cx function", () => {
    const fnClasses = functionStyles();
    const objClasses = objectStyles();

    expectStyles(
      () => {
        return (
          <div class={clsx(fnClasses().testFunction, objClasses().testObject)}>test-element</div>
        );
      },
      { backgroundColor: "#FEF67F", borderColor: "#CE5634" }
    );
  });

  it("allows to override styles with getRef function", () => {
    expectStyles(
      () => {
        const classes = getRefStyles();
        return <div class={clsx(classes().testRef, classes().overrideRef)}>test-element</div>;
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
