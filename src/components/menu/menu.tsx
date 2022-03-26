import { JSX } from "solid-js";

export interface MenuProps {
  children?: JSX.Element;
}

/**
 * The wrapper component that provides context for all its children.
 */
export function Menu(props: MenuProps) {
  return <>{props.children}</>;
}
