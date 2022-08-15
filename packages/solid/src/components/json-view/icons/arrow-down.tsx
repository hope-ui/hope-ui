import { css } from "@stitches/core";
import { Component, JSX, splitProps } from "solid-js";

const ArrowDown: Component<JSX.HTMLAttributes<HTMLSpanElement>> = props => {
  const [style, rest] = splitProps(props, ["class"]);
  return (
    <span {...rest}>
      <svg
        class={`${style.class} ${css({
          paddingLeft: "2px",
          verticalAlign: "top",
        })}`}
        viewBox="0 0 15 15"
        fill="currentColor"
      >
        <path d="M0 5l6 6 6-6z"></path>
      </svg>
    </span>
  );
};

export default ArrowDown;
