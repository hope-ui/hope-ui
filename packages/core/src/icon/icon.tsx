import { isString } from "@hope-ui/utils";
import clsx from "clsx";
import { mergeProps, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { createComponentWithAs, PropsWithAs } from "../factory";

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

export type IconComponentProps = PropsWithAs<"svg">;

function IconComponent(props: IconComponentProps) {
  const defaultProps: IconComponentProps = {
    viewBox: fallbackIcon.viewBox,
  };

  // eslint-disable-next-line solid/reactivity
  props = mergeProps(defaultProps, props);

  const [local, others] = splitProps(props, ["as", "class", "children", "viewBox"]);

  const classes = () => clsx(local.class, "hope-icon");

  /**
   * If the `as` prop is a component (ex: if you're using an icon library).
   * Note: anyone passing the `as` prop, should manage the `viewBox` from the external component
   */
  const shouldRenderComponent = () => local.as && !isString(local.as);

  return (
    <Show
      when={shouldRenderComponent()}
      fallback={
        <svg class={classes()} viewBox={local.viewBox} {...others}>
          <Show when={local.children} fallback={fallbackIcon.path}>
            {local.children}
          </Show>
        </svg>
      }
    >
      <Dynamic component={local.as} class={classes()} {...others} />
    </Show>
  );
}

export const Icon = createComponentWithAs<"svg">(IconComponent);
