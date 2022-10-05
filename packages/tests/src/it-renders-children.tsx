/*!
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-renders-children.tsx
 */

import { Component } from "solid-js";
import { render, screen } from "solid-testing-library";

export function itRendersChildren<P>(Comp: Component<P>, requiredProps: P) {
  it("renders children", () => {
    render(() => (
      <Comp {...requiredProps}>
        <span data-testid="test-children">test children</span>
      </Comp>
    ));

    expect(screen.getByTestId("test-children")).toBeInTheDocument();
  });
}
