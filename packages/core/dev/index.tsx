import { render } from "solid-js/web";

import { AspectRatio, AspectRatioTheme, HopeProvider } from "../src";

function App() {
  return (
    <HopeProvider
      theme={{
        components: {
          AspectRatio: {
            defaultProps: {
              ratio: 32 / 9,
              border: "4px solid cyan",
            },
            styles: (theme, params, getStaticClass) => ({
              root: {
                bg: getStaticClass("root"),
              },
            }),
          } as AspectRatioTheme,
        },
      }}
    >
      <AspectRatio maxW="400px">
        <img src="https://bit.ly/3pq0AcS" alt="Monkey D. Luffy" />
      </AspectRatio>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLDivElement);
