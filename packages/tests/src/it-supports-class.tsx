/*!
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-supports-classname.tsx
 */

import { Component } from "solid-js";
import { render } from "solid-testing-library";

export function itSupportsClass<P>(Comp: Component<P>, requiredProps: P) {
  it("supports class prop", () => {
    const { container } = render(() => <Comp {...requiredProps} class="test-class-name" />);

    expect(container.querySelector(".test-class-name")).toBeInTheDocument();
  });
}
