import Button from "./lib/components/Button/Button";
import { UIPieceProvider } from "./lib/contexts/UIPieceContext";
import { extendTheme } from "./lib/theme/theme";

const customTheme = extendTheme({});

export default function App() {
  return (
    <UIPieceProvider theme={customTheme}>
      <div>
        <Button color="primary" variant="filled">
          Button
        </Button>
        <Button color="primary" variant="light">
          Button
        </Button>
        <Button color="primary" variant="outline">
          Button
        </Button>
        <Button color="primary" variant="dashed">
          Button
        </Button>
        <Button color="primary" variant="text">
          Button
        </Button>
      </div>
      <div>
        <Button color="dark" variant="filled">
          Button
        </Button>
        <Button color="dark" variant="light">
          Button
        </Button>
        <Button color="dark" variant="outline">
          Button
        </Button>
        <Button color="dark" variant="dashed">
          Button
        </Button>
        <Button color="dark" variant="text">
          Button
        </Button>
      </div>
      <div>
        <Button color="neutral" variant="filled">
          Button
        </Button>
        <Button color="neutral" variant="light">
          Button
        </Button>
        <Button color="neutral" variant="outline">
          Button
        </Button>
        <Button color="neutral" variant="dashed">
          Button
        </Button>
        <Button color="neutral" variant="text">
          Button
        </Button>
      </div>
      <div>
        <Button color="success" variant="filled">
          Button
        </Button>
        <Button color="success" variant="light">
          Button
        </Button>
        <Button color="success" variant="outline">
          Button
        </Button>
        <Button color="success" variant="dashed">
          Button
        </Button>
        <Button color="success" variant="text">
          Button
        </Button>
      </div>
      <div>
        <Button color="info" variant="filled">
          Button
        </Button>
        <Button color="info" variant="light">
          Button
        </Button>
        <Button color="info" variant="outline">
          Button
        </Button>
        <Button color="info" variant="dashed">
          Button
        </Button>
        <Button color="info" variant="text">
          Button
        </Button>
      </div>
      <div>
        <Button color="warning" variant="filled">
          Button
        </Button>
        <Button color="warning" variant="light">
          Button
        </Button>
        <Button color="warning" variant="outline">
          Button
        </Button>
        <Button color="warning" variant="dashed">
          Button
        </Button>
        <Button color="warning" variant="text">
          Button
        </Button>
      </div>
      <div>
        <Button color="danger" variant="filled">
          Button
        </Button>
        <Button color="danger" variant="light">
          Button
        </Button>
        <Button color="danger" variant="outline">
          Button
        </Button>
        <Button color="danger" variant="dashed">
          Button
        </Button>
        <Button color="danger" variant="text">
          Button
        </Button>
      </div>

      <Button disabled>Button</Button>
    </UIPieceProvider>
  );
}
