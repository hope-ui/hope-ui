import { Component, createSignal, onMount, Show } from "solid-js";

import ArrayGroup from "./array-group";
import { JsonObject } from "./data-types";
import { JsonViewProps } from "./json-view-props";

interface JsonViewerProps extends JsonViewProps {
  name: string;
  type: string;
  rjvId: string;
}

const JsonViewer: Component<JsonViewerProps> = props => {
  const [isArrayGroup, setIsArrayGroup] = createSignal(false);

  onMount(() => {
    props.name;
    setIsArrayGroup(
      () =>
        Array.isArray(props.src) &&
        typeof props.groupArraysAfterLength === "number" &&
        props.src.length > props.groupArraysAfterLength
    );
  });

  return (
    <div class="pretty-json-container object-container">
      <div class="object-content">
        <Show
          when={isArrayGroup()}
          fallback={
            <JsonObject namespace={[props.name || ""]} depth={0} jsvRoot={true} {...props} />
          }
        >
          <ArrayGroup namespace={[props.name || ""]} depth={0} jsvRoot={true} {...props} />
        </Show>
      </div>
    </div>
  );
};
export default JsonViewer;
