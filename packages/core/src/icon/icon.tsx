/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/icon/src/icon.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { ElementType, isString } from "@hope-ui/utils";
import { JSX, Show, splitProps } from "solid-js";

import { mergeDefaultProps } from "../utils";

const fallbackIcon = {
  viewBox: "0 0 24 24",
  path: () => (
    <path
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
    />
  ),
};

export type IconProps = JSX.SvgSVGAttributes<SVGSVGElement>;

const BaseIcon = hope(
  "svg",
  {
    baseStyle: {
      display: "inline-block",
      flexShrink: 0,
      boxSize: "1em",
      color: "currentColor",
      lineHeight: "1em",
    },
  },
  "hope-Icon-root"
);

export const Icon = createHopeComponent<"svg", IconProps>(props => {
  props = mergeDefaultProps(
    {
      children: fallbackIcon.path,
      viewBox: fallbackIcon.viewBox,
      color: "currentColor",
    },
    props
  );

  const [local, others] = splitProps(props, ["as", "children", "viewBox"]);

  /**
   * If the `as` prop is a component (ex: if you're using an icon library).
   * Note: anyone passing the `as` prop, should manage the `viewBox` from the external component
   */
  const shouldRenderComponent = () => local.as && !isString(local.as);

  return (
    <Show
      when={shouldRenderComponent()}
      fallback={
        <BaseIcon viewBox={local.viewBox} verticalAlign="middle" {...others}>
          {local.children}
        </BaseIcon>
      }
    >
      <BaseIcon as={local.as as ElementType} {...others} />
    </Show>
  );
});
