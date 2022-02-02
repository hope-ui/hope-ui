import { JSX } from "solid-js";

export function IconChevronLeft(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
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
          d="M12.707 5.293a1 1 0 0 1 0 1.414L9.414 10l3.293 3.293a1 1 0 0 1-1.414 1.414l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 0z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
