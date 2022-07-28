import { GlobalStyles, HopeProvider } from "@hope-ui/styles";
import { render } from "solid-js/web";
import { createSignal } from "solid-js";

function App() {
  const [colorMode, setColorMode] = createSignal<"light" | "dark">("light");

  return (
    <HopeProvider
      theme={{
        colorMode: colorMode(),
      }}
    >
      <GlobalStyles
        styles={theme => ({
          "*, *::before, *::after": {
            boxSizing: "border-box",
          },
          body: {
            backgroundColor: theme.colorMode === "dark" ? theme.colors.slate[900] : "white",
            color:
              theme.colorMode === "dark" ? theme.fn.rgba("#fff", 0.9) : theme.colors.slate[800],
            lineHeight: theme.lineHeights.base,
            fontSize: theme.fontSizes.base,
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
          },
        })}
      />
      <button onClick={() => setColorMode(prev => (prev === "dark" ? "light" : "dark"))}>
        Button {colorMode()}
      </button>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
