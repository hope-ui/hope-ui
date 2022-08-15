import { Component } from "solid-js";

import { variableValue } from "../themes/get-style";
import DataTypeLabel from "./data-type-label";
import { DataTypeProps } from "./data-type-props";

interface RegexpProps extends DataTypeProps {
  value: RegExp | string;
}

const Regexp: Component<RegexpProps> = props => {
  const typeName = "regexp";
  return (
    <div class={variableValue({ dataType: "regexp" })}>
      <DataTypeLabel typeName={typeName} {...props} />
      {String(props.value)}
    </div>
  );
};

export default Regexp;
