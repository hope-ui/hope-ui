import { Component } from "solid-js";

import { variableValue } from "../themes/get-style";
import DataTypeLabel from "./data-type-label";
import { DataTypeProps } from "./data-type-props";

interface IntegerProps extends DataTypeProps {
  value: number;
}

const Integer: Component<IntegerProps> = props => {
  const typeName = "int";
  return (
    <div class={variableValue({ dataType: "integer" })}>
      <DataTypeLabel typeName={typeName} {...props} />
      {props.value}
    </div>
  );
};

export default Integer;
