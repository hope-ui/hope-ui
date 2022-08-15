import { Component, createSignal } from "solid-js";

import { JsonViewProps } from "../json-view-props";
import { elipsis, variableValue } from "../themes/get-style";
import DataTypeLabel from "./data-type-label";

interface FunctionProps extends JsonViewProps {
  value: any;
}

const Function: Component<FunctionProps> = props => {
  const [collapsed, setCollapsed] = createSignal(
    false
    // AttributeStore.get(props.rjvId, props.namespace, "collapsed", true),
  );

  const toggleCollapsed = () => {
    setCollapsed((prev: boolean) => {
      const collapsed = !prev;

      // will be called after setState takes effect.
      // attributeStore.set(props.rjvId, props.namespace, "collapsed", collapsed);

      return collapsed;
    });
  };

  const getFunctionDisplay = (collapsed: boolean) => {
    if (collapsed) {
      return (
        <span>
          {props.value
            .toString()
            .slice(9, -1)
            .replace(/\{[\s\S]+/, "")}
          <span class="function-collapsed" style={{ "font-weight": "bold" }}>
            <span>{"{"}</span>
            <span class={elipsis()}>...</span>
            <span>{"}"}</span>
          </span>
        </span>
      );
    } else {
      return props.value.toString().slice(9, -1);
    }
  };

  const typeName = "function";
  return (
    <div class={variableValue({ dataType: "function" })}>
      <DataTypeLabel typeName={typeName} {...props} />
      <span
        class="rjv-function-container function-value"
        onClick={toggleCollapsed}
        onKeyPress={e => {
          if (e.key == "space") toggleCollapsed();
        }}
        role="button"
        tabIndex="0"
      >
        {getFunctionDisplay(collapsed())}
      </span>
    </div>
  );
};

export default Function;
