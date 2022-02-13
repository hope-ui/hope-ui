import { createIcon } from "../icon/create-icon";

export const IconSelector = createIcon({
  path: () => (
    <g fill="none" stroke="currentColor">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
      />
    </g>
  ),
});
