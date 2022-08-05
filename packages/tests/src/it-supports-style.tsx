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
