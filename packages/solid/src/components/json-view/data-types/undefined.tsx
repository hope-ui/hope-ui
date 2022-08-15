import { Component } from "solid-js";

import { variableValue } from "../themes/get-style";

const Undefined: Component = () => {
  return <div class={variableValue({ dataType: "undefined" })}>undefined</div>;
};

export default Undefined;
