import { Component, JSX, splitProps } from "solid-js";

import { defaultIconStyle } from "./get-icon-style";

const Add: Component<JSX.HTMLAttributes<HTMLSpanElement>> = props => {
  const [style, rest] = splitProps(props, ["class"]);
  return (
    <span {...rest}>
      <svg
        class={`${defaultIconStyle()} ${style.class}`}
        viewBox="0 0 40 40"
        fill="currentColor"
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          <path d="m31.6 21.6h-10v10h-3.2v-10h-10v-3.2h10v-10h3.2v10h10v3.2z" />
        </g>
      </svg>
    </span>
  );
};

export default Add;
