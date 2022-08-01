import { render } from "solid-js/web";

import { DefaultProps, expandResponsive, ThemeProvider, useTheme } from "../src";

function Test(props: DefaultProps) {
  const theme = useTheme();

  const expandedStyleProps = expandResponsive(props)(theme());

  return (
    <div>
      <pre>{JSON.stringify(expandedStyleProps, null, 2)}</pre>
    </div>
  );
}

function App() {
  return (
    <>
      <ThemeProvider>
        <Test
          m={[4, null, 8]}
          color="gray.600"
          d={["block", "flex"]}
          p={{
            base: 8,
            "2xl": 42,
            sm: 3,
            xl: 9,
            lg: 78,
            md: 56,
          }}
        />
      </ThemeProvider>
    </>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
