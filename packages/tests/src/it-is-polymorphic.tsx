/*!
 * Original code by Mantinedev
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/master/src/mantine-tests/src/it-is-polymorphic.tsx
 */

import { Component } from "solid-js";
import { render } from "solid-testing-library";

export function itIsPolymorphic<P>(Comp: Component<P>, requiredProps: P, selector?: string) {
  it("is polymorphic", () => {
    const getTarget = (container: HTMLElement) => {
      return selector ? container.querySelector(selector) : (container.firstChild as HTMLElement);
    };

    const TestComponent = (props: any) => {
      return <mark data-test-prop {...props} />;
    };

    const { container: withTag } = render(() => (
      <Comp as="a" href="https://mantine.dev" {...requiredProps} />
    ));

    const { container: withComponent } = render(() => (
      <Comp as={TestComponent} {...requiredProps} />
    ));

    expect(getTarget(withTag)?.tagName).toBe("A");
    expect(getTarget(withComponent)?.tagName).toBe("MARK");
  });
}
