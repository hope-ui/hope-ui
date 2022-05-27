import { Alert, AlertIcon } from "@hope-ui/core";

export default function App() {
  return (
    <div class="flex flex-col space-y-4 m-4 max-w-md">
      <Alert>
        <AlertIcon class="mr-2 h-8 w-8" />
        <span>Hi mom</span>
      </Alert>
      <Alert status="success">
        <AlertIcon class="mr-2" />
        <span>Hi mom</span>
      </Alert>
      <Alert status="warning">
        <AlertIcon class="mr-2" />
        <span>Hi mom</span>
      </Alert>
      <Alert status="danger">
        <AlertIcon class="mr-2" />
        <span>Hi mom</span>
      </Alert>
    </div>
  );
  //return <div>Hello Hope UI</div>;
}
