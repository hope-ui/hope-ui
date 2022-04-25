import { createSignal, onMount } from "solid-js";

import { HopeWrapper } from "../../components/storybook-utils";
import { useEvent } from "./";

export default {
  title: "Hooks/UseEvent",
  parameters: { layout: "centered" },
  decorators: [
    (Story: any) => (
      <HopeWrapper>
        <Story />
      </HopeWrapper>
    ),
  ],
};

export const Default = () => {
  const [state, setState] = createSignal(1);
  let element: any;
  useEvent({
    element: window,
    eventName: "resize",
    handler: () => setState(value => value + 1),
  });
  onMount(() => {
    useEvent({
      element,
      eventName: "click",
      handler: () => setState(value => value + 1),
    });
  });

  return (
    <div>
      <div>{state()}</div>
      <button ref={element}>emit</button>
    </div>
  );
};
Default.storyName = "Anchor";
