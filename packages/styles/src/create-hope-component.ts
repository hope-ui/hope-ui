import { Component } from "solid-js";
import { As, HopeComponent, HopeProps } from "./types";

/** Factory function to create component with the "as" prop. */
export function createComponentWithAs<DefaultType extends As, Props = {}>(
  component: Component<HopeProps<DefaultType, Props>>
) {
  return component as unknown as HopeComponent<DefaultType, Props>;
}
