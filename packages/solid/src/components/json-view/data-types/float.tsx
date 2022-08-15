import { Component } from "solid-js";

import { variableValue } from "../themes/get-style";
import DataTypeLabel from "./data-type-label";
import { DataTypeProps } from "./data-type-props";

interface FloatProps extends DataTypeProps {
  value: number;
}

const Float: Component<FloatProps> = props => {
  const typeName = "float";
  return (
    <div class={variableValue({ dataType: "float" })}>
      <DataTypeLabel typeName={typeName} {...props} />
      {props.value}
    </div>
  );
};

export default Float;
