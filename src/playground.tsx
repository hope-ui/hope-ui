import "./playground.scss";

import { render } from "solid-js/web";

import { Button, Container, extendTheme, HopeProvider, Paper } from "./";

const theme = extendTheme({
  components: {
    Paper: {
      withBorder: true,
      shadow: "xl",
    },
  },
});

function App() {
  return (
    <HopeProvider theme={theme}>
      <Container>
        <Paper>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Incidunt, nesciunt!</p>
          <Button>Button</Button>
        </Paper>
      </Container>
    </HopeProvider>
  );
}

render(() => <App />, document.getElementById("root") as HTMLElement);
