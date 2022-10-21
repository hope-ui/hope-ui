/*!
 * Portions of this file are based on code from mantinedev.
 * MIT Licensed, Copyright (c) 2021 Vitaly Rtishchev.
 *
 * Credits to the Mantinedev team:
 * https://github.com/mantinedev/mantine/blob/4fa634ebddf15a8515a9018e37b1e86d2e00883a/src/mantine-core/src/Input/Input.test.tsx
 *
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/95aa4499c72de28e91dd9274177c529db55e7964/packages/components/input/tests/input.test.tsx
 */

import {
  checkAccessibility,
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { Input, InputProps } from "./input";

const defaultProps: InputProps = {};

describe("Input", () => {
  /*
  checkAccessibility([
    <Input aria-label="test-input" />,
    <Input placeholder="test-input" />,
    <Input placeholder="test-input" isInvalid />,
  ]);
  */
  itIsPolymorphic(Input as any, defaultProps);
  itRendersChildren(Input as any, defaultProps);
  itSupportsClass(Input as any, defaultProps);
  itHasSemanticClass(Input as any, defaultProps, "hope-Input-root");
  itSupportsRef(Input as any, defaultProps, HTMLInputElement);
  itSupportsStyle(Input as any, defaultProps);

  it("supports setting native size with the 'htmlSize' prop", () => {
    render(() => <Input data-testid="input" htmlSize={4} />);
    expect(screen.getByTestId("input")).toHaveAttribute("size", "4");
  });

  it("supports setting 'required' attribute with the 'isRequired' prop", () => {
    render(() => <Input data-testid="input" isRequired />);
    expect(screen.getByTestId("input")).toHaveAttribute("required");
  });

  it("supports setting 'disabled' attribute with the 'isDisabled' prop", () => {
    render(() => <Input data-testid="input" isDisabled />);
    expect(screen.getByTestId("input")).toHaveAttribute("disabled");
  });

  it("supports setting 'readonly' attribute with the 'isReadOnly' prop", () => {
    render(() => <Input data-testid="input" isReadOnly />);
    expect(screen.getByTestId("input")).toHaveAttribute("readonly");
  });

  it("supports setting invalid state with the 'isInvalid' prop", () => {
    render(() => <Input data-testid="input" isInvalid />);
    expect(screen.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
  });
});
