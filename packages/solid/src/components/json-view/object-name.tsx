import { Component, createSignal, Match, onMount, Show, Switch } from "solid-js";

import { arrayKey, colon, objectName } from "./themes";

interface ObjectNameProps {
  parentType?: "array" | "array_group" | "object";
  namespace: Array<string | number>;
  quotesOnKeys?: boolean;

  jsvRoot?: boolean;
  name?: string | false | null;
  displayArrayKey?: boolean;
}

const ObjectName: Component<ObjectNameProps> = props => {
  const [displayName, setDisplayName] = createSignal("");

  onMount(() => {
    setDisplayName(() => (props.name ? props.name : ""));
  });

  return (
    <Switch
      fallback={
        <span class={objectName()}>
          <span class="object-key">
            {props.quotesOnKeys && <span style={{ "vertical-align": "top" }}>"</span>}
            <span>{displayName()}</span>
            {props.quotesOnKeys && <span style={{ "vertical-align": "top" }}>"</span>}
          </span>
          <span class={colon()}>:</span>
        </span>
      }
    >
      <Match when={props.parentType === "array"}>
        <Show when={props.displayArrayKey} fallback={<span />}>
          <span class={arrayKey()}>
            <span class="array-key">{displayName()}</span>
            <span class={colon()}>:</span>
          </span>
        </Show>
      </Match>
      <Match when={props.jsvRoot && !props.name}>
        <span />
      </Match>
    </Switch>
  );
};

export default ObjectName;
