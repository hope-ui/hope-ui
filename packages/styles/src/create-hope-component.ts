import { Component } from "solid-js";

import { As, HopeComponent, HopeProps } from "./types";

/** Factory function to create component with Hope UI props. */
export function createHopeComponent<DefaultType extends As, Props = {}>(
  component: Component<HopeProps<DefaultType, Props>>
) {
  return component as unknown as HopeComponent<DefaultType, Props>;
}
