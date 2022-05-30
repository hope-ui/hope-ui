import "./index.scss";

import { For } from "solid-js";
import { render } from "solid-js/web";

import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  createIcon,
  HopeProvider,
  Kbd,
  useColorMode,
} from "../src";

const IconBadgeCheck = createIcon({
  viewBox: "0 0 20 20",
  path: () => (
    <path
      fill="currentColor"
      fill-rule="evenodd"
      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clip-rule="evenodd"
    />
  ),
});

function App() {
  const { toggleColorMode } = useColorMode();

  const handleClick = () => {
    console.log("fired");
  };

  return (
    <div
      style={{ display: "flex", "flex-direction": "column", "align-items": "center", gap: "16px" }}
    >
      <button onClick={toggleColorMode}>Toggle color mode</button>
      <Kbd>shift</Kbd>
      <For each={["success", "info", "warning", "danger"]}>
        {status => (
          <div style={{ display: "flex", "align-items": "center", gap: "16px" }}>
            <For each={["solid", "subtle", "left-accent", "top-accent"]}>
              {variant => (
                <Alert status={status as any} variant={variant as any}>
                  <AlertIcon style={{ "margin-right": "16px" }} />
                  Fire on!
                </Alert>
              )}
            </For>
          </div>
        )}
      </For>
      <div style={{ display: "flex", "align-items": "center", gap: "16px" }}>
        <For each={["xs", "sm", "md", "lg", "xl"]}>
          {size => (
            <Button
              size={size as any}
              leftIcon={<IconBadgeCheck style={{ "font-size": "1.5em" }} />}
            >
              Button
            </Button>
          )}
        </For>
      </div>
      <For each={["primary", "accent", "neutral", "success", "info", "warning", "danger"]}>
        {colorScheme => (
          <div style={{ display: "flex", "align-items": "center", gap: "16px" }}>
            <For each={["solid", "subtle", "outline", "dashed", "ghost"]}>
              {variant => (
                <Button
                  variant={variant as any}
                  colorScheme={colorScheme as any}
                  leftIcon={<IconBadgeCheck style={{ "font-size": "1.5em" }} />}
                >
                  Button
                </Button>
              )}
            </For>
          </div>
        )}
      </For>
      <ButtonGroup variant="outline" colorScheme="primary" style={{ gap: "24px" }}>
        <Button colorScheme="info">Save</Button>
        <Button>Cancel</Button>
      </ButtonGroup>
      <ButtonGroup size="md" variant="outline" colorScheme="primary" isAttached>
        <Button style={{ "margin-right": "-1px" }}>Save</Button>
        <Button>Foo</Button>
      </ButtonGroup>
    </div>
  );

  //return <div>Hello Hope UI</div>;
}

render(
  () => (
    <HopeProvider>
      <App />
    </HopeProvider>
  ),
  document.getElementById("root") as HTMLDivElement
);
