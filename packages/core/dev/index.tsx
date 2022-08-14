import { render } from "solid-js/web";

import { ButtonTheme, extendTheme, HopeProvider } from "../src";
import App from "./App";

const theme = extendTheme({
  components: {
    Button: {
      defaultProps: {},
      styleConfig: {
        baseStyle: {},
        variants: {
          variant: {
            outlined: {},
          },
        },
      },
    } as ButtonTheme,
  },
});

render(
  () => (
    <HopeProvider withGlobalStyles theme={theme}>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
