import { Component } from "solid-js";
import { render } from "solid-testing-library";

export function itSupportsRef<P>(
  Comp: Component<P>,
  requiredProps: P,
  refType: any,
  refProp = "ref"
) {
  it(refProp ? `supports getting ref with ${refProp} prop` : "supports ref", async () => {
    let ref: typeof refType;

    render(() => <Comp {...requiredProps} ref={ref} />);

    await Promise.resolve();

    expect(ref).toBeInstanceOf(refType);
  });
}
