import "./playground.css";

import { render } from "solid-js/web";

import { Anchor, HopeProvider, HStack, IconExternalLink, Text } from ".";

export function App() {
  return (
    <div>
      <HStack spacing="$4" p="$4">
        <Anchor>Hope UI</Anchor>
        <Anchor href="https://hope-ui-solid.vercel.app" external>
          Hope Design system <IconExternalLink mx="2px" />
        </Anchor>
        <Text>
          Did you know that{" "}
          <Anchor color="$primary9" href="#">
            links can live inline with text
          </Anchor>
        </Text>
      </HStack>
    </div>
  );
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLElement
);
