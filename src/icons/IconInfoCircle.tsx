import { JSX } from "solid-js";

export function IconInfoCircle(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid meet"
      width="1em"
      height="1em"
      viewBox="0 0 20 20"
      {...props}
    >
      <g fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M18 10a8 8 0 1 1-16 0a8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
