import type { JSX } from "solid-js";

export function IconCrossCircled(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
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
          d="M.877 7.5a6.623 6.623 0 1 1 13.246 0a6.623 6.623 0 0 1-13.246 0zM7.5 1.827a5.673 5.673 0 1 0 0 11.346a5.673 5.673 0 0 0 0-11.346zm2.354 3.32a.5.5 0 0 1 0 .707L8.207 7.5l1.647 1.646a.5.5 0 0 1-.708.708L7.5 8.207L5.854 9.854a.5.5 0 0 1-.708-.708L6.793 7.5L5.146 5.854a.5.5 0 0 1 .708-.708L7.5 6.793l1.646-1.647a.5.5 0 0 1 .708 0z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
