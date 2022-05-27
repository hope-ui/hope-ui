import { Alert, AlertIcon, useColorMode } from "@hope-ui/core";

export default function App() {
  const { toggleColorMode } = useColorMode();

  return (
    <div class="flex flex-col items-center space-y-4">
      <button onClick={toggleColorMode}>Toggle color mode</button>
      <Alert status="warning" variant="solid">
        <AlertIcon class="mr-2.5" />
        Data uploaded to the server. Fire on!
      </Alert>

      <Alert status="warning" variant="subtle">
        <AlertIcon class="mr-2.5" />
        Data uploaded to the server. Fire on!
      </Alert>

      <Alert status="warning" variant="left-accent">
        <AlertIcon class="mr-2.5" />
        Data uploaded to the server. Fire on!
      </Alert>

      <Alert status="warning" variant="top-accent">
        <AlertIcon class="mr-2.5" />
        Data uploaded to the server. Fire on!
      </Alert>
    </div>
  );

  //return <div>Hello Hope UI</div>;
}
