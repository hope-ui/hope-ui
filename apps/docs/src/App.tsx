import { Alert, AlertIcon, Button, createIcon, useColorMode } from "@hope-ui/core";
import { For } from "solid-js";

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

export default function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <div class="flex flex-col items-center space-y-4">
      <button onClick={toggleColorMode}>Toggle color mode</button>
      <For each={["success", "info", "warning", "danger"]}>
        {status => (
          <div class="flex items-center space-x-4">
            <For each={["solid", "subtle", "left-accent", "top-accent"]}>
              {variant => (
                <Alert status={status as any} variant={variant as any}>
                  <AlertIcon class="mr-2.5" />
                  Fire on!
                </Alert>
              )}
            </For>
          </div>
        )}
      </For>
      <Button leftIcon={<IconBadgeCheck class="text-[1.5em]" />}>Button</Button>
      <For each={["primary", "accent", "dark", "neutral", "success", "info", "warning", "danger"]}>
        {colorScheme => (
          <div class="flex items-center space-x-4">
            <For each={["solid", "subtle", "outline", "dashed", "ghost"]}>
              {variant => (
                <Button
                  variant={variant as any}
                  colorScheme={colorScheme as any}
                  leftIcon={<IconBadgeCheck class="text-[1.5em]" />}
                >
                  Button
                </Button>
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );

  //return <div>Hello Hope UI</div>;
}
