import { Component } from "solid-js";

import { variableValue } from "../themes";
import DataTypeLabel from "./data-type-label";
import { DataTypeProps } from "./data-type-props";

interface BooleanProps extends DataTypeProps {
  value: boolean;
}

const Boolean: Component<BooleanProps> = props => {
  const typeName = "bool";
  return (
    <div class={variableValue({ dataType: "boolean" })}>
      <DataTypeLabel typeName={typeName} {...props} />
      {props.value ? "true" : "false"}
    </div>
  );
};

export default Boolean;
