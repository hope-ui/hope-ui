import { css } from "@/styled-system";
import { dash } from "@/styled-system/keyframes";

import { Icon, IconProps } from "../icon/icon";

const checkboxIconStyles = css({
  strokeDasharray: 48,
  strokeDashoffset: 48,
  animation: `${dash} 250ms linear forwards`,
});

export const CheckIcon = (props: IconProps<"svg">) => (
  <Icon {...props}>
    <g fill="none">
      <path
        class={checkboxIconStyles()}
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M5 13l4 4L19 7"
      />
    </g>
  </Icon>
);

export const IndeterminateIcon = (props: IconProps<"svg">) => (
  <Icon {...props}>
    <g fill="none">
      <line
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        x1="4"
        x2="20"
        y1="12"
        y2="12"
      />
    </g>
  </Icon>
);
