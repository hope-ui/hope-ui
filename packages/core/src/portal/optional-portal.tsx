import { ComponentProps, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

export interface OptionalPortalProps extends ComponentProps<typeof Portal> {
  /** Whether the component should be rendered in a `Portal`. */
  withinPortal?: boolean;
}

/**
 * `OptionalPortal` lets you configure whether children should be rendered in Portal.
 *  It accepts the same props as `Portal` component.
 */
export function OptionalPortal(props: OptionalPortalProps) {
  const [local, others] = splitProps(props, ["children", "withinPortal"]);

  return (
    <Show when={local.withinPortal} fallback={local.children}>
      <Portal {...others}>{local.children}</Portal>
    </Show>
  );
}
