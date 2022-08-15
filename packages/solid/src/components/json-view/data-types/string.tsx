import { css } from "@stitches/core";
import { Component, createEffect, createSignal, onMount, Show } from "solid-js";

import { toType } from "../helpers/util";
import { JsonViewProps } from "../json-view-props";
import { attributeStore } from "../store/object-attributes";
import { elipsis, variableValue } from "../themes/get-style";
import DataTypeLabel from "./data-type-label";

interface StringProps extends JsonViewProps {
  value: string;
  rjvId: string;
  namespace: any;
}

const String: Component<StringProps> = props => {
  const [collapsed, setCollapsed] = createSignal(false);

  onMount(() => {
    setCollapsed(() => attributeStore.get(props.rjvId, props.namespace, "collapsed", true));
  });

  const toggleCollapsed = () => {
    if (collapsible())
      setCollapsed((prev: boolean) => {
        const collapsed = !prev;

        // will be called after setState takes effect.
        attributeStore.set(props.rjvId, props.namespace, "collapsed", collapsed);

        return collapsed;
      });
  };
  const typeName = "string";
  const [collapsible, setCollapsible] = createSignal(false);

  createEffect(() => {
    setCollapsible(
      () =>
        toType(props.collapseStringsAfterLength) === "integer" &&
        props.value.length > (props.collapseStringsAfterLength || false)
    );
  });

  return (
    <div class={variableValue({ dataType: "string" })}>
      <DataTypeLabel typeName={typeName} {...props} />
      <div
        class={
          "string-value " +
          css({ display: "inline-block", cursor: collapsible() ? "pointer" : "default" })
        }
        onClick={() => toggleCollapsed()}
        onKeyPress={e => {
          if (e.key == "space") toggleCollapsed();
        }}
        role="button"
        tabIndex="0"
      >
        <Show when={collapsed()} fallback={props.value}>
          <span>
            {props.value.substring(0, props.collapseStringsAfterLength || undefined)}
            <span class={elipsis()}> ...</span>
          </span>
        </Show>
      </div>
    </div>
  );
};

export default String;
