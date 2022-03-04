import { Icon, IconProps } from "../icon/icon";

export const CheckboxCheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <g fill="none">
      <path stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </g>
  </Icon>
);

export const CheckboxIndeterminateIcon = (props: IconProps) => (
  <Icon {...props}>
    <g fill="none">
      <line stroke="currentColor" stroke-width="4" stroke-linecap="round" x1="5" x2="19" y1="12" y2="12" />
    </g>
  </Icon>
);
