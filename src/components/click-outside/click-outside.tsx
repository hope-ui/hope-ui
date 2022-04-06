import { children, PropsWithChildren } from "solid-js";

import { useClickOutside } from "../../hooks/use-click-outside";

export type ClickOutsideProps = PropsWithChildren<{
  /**
   * Callback invoked when the user click outside.
   */
  onClickOutside: (event: Event) => void;
}>;

/**
 * Renderless component that manage outside click on its children.
 * It accepts one `JSX.Element` as children, no `Fragment`.
 */
export function ClickOutside(props: ClickOutsideProps) {
  const resolvedChildren = children(() => props.children);

  useClickOutside({
    element: () => resolvedChildren() as HTMLElement,
    handler: event => props.onClickOutside(event),
  });

  return resolvedChildren;
}
