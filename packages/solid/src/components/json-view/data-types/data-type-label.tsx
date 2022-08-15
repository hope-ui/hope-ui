import { Component, Show } from "solid-js";

import { dataTypeLabel } from "../themes";
import { DataTypeProps } from "./data-type-props";

interface DataTypeLabelProps extends DataTypeProps {
  typeName: string;
}

const DataTypeLabel: Component<DataTypeLabelProps> = props => {
  return (
    <Show when={props.displayDataTypes}>
      <span class={`data-type-label ${dataTypeLabel()}`}>{props.typeName}</span>
    </Show>
  );
};

export default DataTypeLabel;
