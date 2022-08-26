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
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
};

export type IconProps = JSX.SvgSVGAttributes<SVGSVGElement>;

const BaseIcon = hope(
  "svg",
  {
    base: {
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
          <Show when={local.children} fallback={fallbackIcon.path}>
            {local.children}
          </Show>
        </BaseIcon>
      }
    >
      <BaseIcon as={local.as as ElementType} {...others} />
    </Show>
  );
});
