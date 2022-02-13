import { createIcon } from "../icon/create-icon";

export const IconChevronDoubleRight = createIcon({
  path: () => (
    <g fill="none" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </g>
  ),
});
