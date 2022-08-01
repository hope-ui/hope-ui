import { render } from "solid-js/web";

import { DefaultProps, ThemeProvider, toCSSObject, useSx, useTheme } from "../src";

function Test(props: DefaultProps & { class?: string }) {
  const theme = useTheme();

  const styles = toCSSObject(props as any, theme());

  const className = useSx(props);

  return (
    <div class={className()}>
      <pre>{JSON.stringify(styles, null, 2)}</pre>
    </div>
  );
}

function App() {
  return (
    <>
      <ThemeProvider>
        <Test
          color="white"
          bg="tomato"
          w="full"
          p="4"
          _hover={theme => ({
            border: `4px solid ${theme.colors.blue["500"]}`,
            bg: "gray.600",
            mx: 4,
          })}
          sx={{
            borderColor: "red.900",
            bg: "green.600",
            mx: 12,
          }}
        />
      </ThemeProvider>
    </>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
