/*!
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-supports-style.tsx
 */

import { Component } from "solid-js";
import { render } from "solid-testing-library";

export function itSupportsStyle<P>(Comp: Component<P>, requiredProps: P) {
  it("supports style property", async () => {
    const { container } = render(() => (
      <Comp {...requiredProps} style={{ border: "1px solid cyan" }} />
    ));

    expect(container.firstElementChild).toHaveStyle({ border: "1px solid cyan" });
  });
}
