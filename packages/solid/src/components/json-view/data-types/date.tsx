import { Component } from "solid-js";

import { variableValue } from "../themes/get-style";
import DataTypeLabel from "./data-type-label";
import { DataTypeProps } from "./data-type-props";

interface DateProps extends DataTypeProps {
  value: Date;
}

const Date: Component<DateProps> = props => {
  const typeName = "date";
  const displayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return (
    <div class={variableValue({ dataType: "date" })}>
      <DataTypeLabel typeName={typeName} {...props} />
      {props.value.toLocaleTimeString("en-us", displayOptions)}
    </div>
  );
};

export default Date;
