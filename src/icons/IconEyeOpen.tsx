import { JSX } from "solid-js";

export function IconEyeOpen(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
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
        <path d="M10 12a2 2 0 1 0 0-4a2 2 0 0 0 0 4z" fill="currentColor" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 1 1-8 0a4 4 0 0 1 8 0z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
