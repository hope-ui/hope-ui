import type { JSX } from "solid-js";

export function IconInfoCircled(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
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
          d="M7.5.877a6.623 6.623 0 1 0 0 13.246A6.623 6.623 0 0 0 7.5.877zM1.827 7.5a5.673 5.673 0 1 1 11.346 0a5.673 5.673 0 0 1-11.346 0zm6.423-3a.75.75 0 1 1-1.5 0a.75.75 0 0 1 1.5 0zM6 6h1.5a.5.5 0 0 1 .5.5V10h1v1H6v-1h1V7H6V6z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
