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
