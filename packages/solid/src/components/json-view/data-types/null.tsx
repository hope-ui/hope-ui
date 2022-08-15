import { Component } from "solid-js";

import { variableValue } from "../themes/get-style";

const Null: Component = () => {
  return <div class={variableValue({ dataType: "null" })}>NULL</div>;
};

export default Null;
