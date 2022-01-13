import type { JSX } from "solid-js";

export function IconDoubleArrowRight(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      width="1em"
      height="1em"
      viewBox="0 0 15 15"
      {...props}
    >
      <g fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.146 11.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 1 0-.708.708L5.793 7.5l-3.647 3.646zm6 0a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 1 0-.708.708L11.793 7.5l-3.647 3.646z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
