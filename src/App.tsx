import { createSignal, JSX } from "solid-js";

import Button from "./lib/components/Button/Button";
import { HopeProvider } from "./lib/contexts/HopeContext";
import { extendTheme } from "./lib/theme";

const customTheme = extendTheme({
  components: {
    Button: {
      size: "sm",
    },
  },
});

function IconLayers(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      width="1em"
      height="1em"
      preserveAspectRatio="xMidYMid meet"
      viewBox="0 0 15 15"
      {...props}
    >
      <g fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.754.82a.5.5 0 0 0-.508 0l-5.5 3.25a.5.5 0 0 0 0 .86l5.5 3.25a.5.5 0 0 0 .508 0l5.5-3.25a.5.5 0 0 0 0-.86L7.754.82zM7.5 7.17L2.983 4.5L7.5 1.83l4.517 2.67L7.5 7.17zm-5.93.326a.5.5 0 0 1 .684-.176l5.246 3.1l5.246-3.1a.5.5 0 1 1 .508.86l-5.5 3.25a.5.5 0 0 1-.508 0l-5.5-3.25a.5.5 0 0 1-.177-.684zm0 3a.5.5 0 0 1 .684-.177l5.246 3.1l5.246-3.1a.5.5 0 0 1 .508.861l-5.5 3.25a.5.5 0 0 1-.508 0l-5.5-3.25a.5.5 0 0 1-.177-.684z"
          fill="currentColor"
        ></path>
      </g>
    </svg>
  );
}

export default function App() {
  const [loading, setLoading] = createSignal(false);

  return (
    <HopeProvider theme={customTheme}>
      <Button variant="default" onClick={() => setLoading(prev => !prev)}>
        Change loading state
      </Button>
      <div>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="primary"
          variant="filled"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="primary"
          variant="light"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="primary"
          variant="outline"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="primary"
          variant="dashed"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="primary"
          variant="text"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
      </div>
      <div>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="dark"
          variant="filled"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="dark"
          variant="light"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="dark"
          variant="outline"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="dark"
          variant="dashed"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="dark"
          variant="text"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
      </div>
      <div>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="neutral"
          variant="filled"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="neutral"
          variant="light"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="neutral"
          variant="outline"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="neutral"
          variant="dashed"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="neutral"
          variant="text"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
      </div>
      <div>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="success"
          variant="filled"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="success"
          variant="light"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="success"
          variant="outline"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="success"
          variant="dashed"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="success"
          variant="text"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
      </div>
      <div>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="info"
          variant="filled"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="info"
          variant="light"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="info"
          variant="outline"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="info"
          variant="dashed"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="info"
          variant="text"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
      </div>
      <div>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="warning"
          variant="filled"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="warning"
          variant="light"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="warning"
          variant="outline"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="warning"
          variant="dashed"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="warning"
          variant="text"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
      </div>
      <div>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="danger"
          variant="filled"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="danger"
          variant="light"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="danger"
          variant="outline"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="danger"
          variant="dashed"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
        <Button
          leftIcon={<IconLayers />}
          rightIcon={<IconLayers />}
          color="danger"
          variant="text"
          loading={loading()}
        >
          {loading() ? "Loading" : "Button"}
        </Button>
      </div>

      <Button disabled>Button</Button>
    </HopeProvider>
  );
}
