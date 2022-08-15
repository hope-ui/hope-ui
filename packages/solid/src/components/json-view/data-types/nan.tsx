import { Component } from "solid-js";

import { variableValue } from "../themes/get-style";

const Nan: Component = () => {
  return <div class={variableValue({ dataType: "nan" })}>NaN</div>;
};

export default Nan;
