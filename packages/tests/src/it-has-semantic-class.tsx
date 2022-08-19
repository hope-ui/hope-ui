import { Component } from "solid-js";
import { render } from "solid-testing-library";

export function itHasSemanticClass<P>(Comp: Component<P>, requiredProps: P, semanticClass: string) {
  it("has semantic class", () => {
    const { container } = render(() => <Comp {...requiredProps} />);

    expect(container.querySelector(`.${semanticClass}`)).toBeInTheDocument();
  });
}
