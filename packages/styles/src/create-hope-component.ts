import { Component } from "solid-js";

import { As, HopeProps, PolymorphicComponent, PolymorphicProps } from "./types";

/** A component with Hope UI props. */
export type HopeComponent<DefaultType extends As, Props = {}> = PolymorphicComponent<
  DefaultType,
  Props & HopeProps
>;

/** Create a polymorphic Hope UI component with the `as` and `system style` props support. */
export function createHopeComponent<DefaultType extends As, Props = {}>(
  component: Component<PolymorphicProps<DefaultType, Props & HopeProps>>
) {
  return component as unknown as HopeComponent<DefaultType, Props>;
}
