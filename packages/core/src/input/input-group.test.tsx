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
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { FormControl } from "../form-control";
import { Input } from "./input";
import { InputGroupLeftAddon, InputGroupRightAddon } from "./input-group-addon";
import { InputGroup, InputGroupProps } from "./input-group";
import { InputGroupLeftSection, InputGroupRightSection } from "./input-group-section";

const defaultProps: InputGroupProps = {};

describe("InputGroup", () => {
  itIsPolymorphic(InputGroup as any, defaultProps);
  itRendersChildren(InputGroup as any, defaultProps);
  itSupportsClass(InputGroup as any, defaultProps);
  itHasSemanticClass(InputGroup as any, defaultProps, "hope-InputGroup-root");
  itSupportsRef(InputGroup as any, defaultProps, HTMLDivElement);
  itSupportsStyle(InputGroup as any, defaultProps);

  it("renders left and right addons", () => {
    render(() => (
      <InputGroup>
        <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
        <Input />
        <InputGroupRightAddon>right-addon</InputGroupRightAddon>
      </InputGroup>
    ));

    expect(screen.getByText("left-addon")).toBeInTheDocument();
    expect(screen.getByText("right-addon")).toBeInTheDocument();
  });

  it("renders left and right sections", () => {
    render(() => (
      <InputGroup>
        <InputGroupLeftSection>left-section</InputGroupLeftSection>
        <Input />
        <InputGroupRightSection>right-section</InputGroupRightSection>
      </InputGroup>
    ));

    expect(screen.getByText("left-section")).toBeInTheDocument();
    expect(screen.getByText("right-section")).toBeInTheDocument();
  });

  it("should forward the 'isRequired' prop to input, sections and addons", () => {
    render(() => (
      <InputGroup data-testid="input-group" isRequired>
        <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
        <InputGroupLeftSection>left-section</InputGroupLeftSection>
        <Input data-testid="input" />
        <InputGroupRightSection>right-section</InputGroupRightSection>
        <InputGroupRightAddon>right-addon</InputGroupRightAddon>
      </InputGroup>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("required");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-required");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-required");
    expect(screen.getByText("left-section")).toHaveAttribute("data-required");
    expect(screen.getByText("right-section")).toHaveAttribute("data-required");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-required");
  });

  it("should forward the 'isRequired' prop from a form control", () => {
    render(() => (
      <FormControl isRequired>
        <InputGroup data-testid="input-group">
          <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
          <InputGroupLeftSection>left-section</InputGroupLeftSection>
          <Input data-testid="input" />
          <InputGroupRightSection>right-section</InputGroupRightSection>
          <InputGroupRightAddon>right-addon</InputGroupRightAddon>
        </InputGroup>
      </FormControl>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("required");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-required");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-required");
    expect(screen.getByText("left-section")).toHaveAttribute("data-required");
    expect(screen.getByText("right-section")).toHaveAttribute("data-required");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-required");
  });

  it("should forward the 'isDisabled' prop to input, sections and addons", () => {
    render(() => (
      <InputGroup data-testid="input-group" isDisabled>
        <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
        <InputGroupLeftSection>left-section</InputGroupLeftSection>
        <Input data-testid="input" />
        <InputGroupRightSection>right-section</InputGroupRightSection>
        <InputGroupRightAddon>right-addon</InputGroupRightAddon>
      </InputGroup>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("disabled");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-disabled");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-disabled");
    expect(screen.getByText("left-section")).toHaveAttribute("data-disabled");
    expect(screen.getByText("right-section")).toHaveAttribute("data-disabled");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-disabled");
  });

  it("should forward the 'isDisabled' prop from a form control", () => {
    render(() => (
      <FormControl isDisabled>
        <InputGroup data-testid="input-group">
          <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
          <InputGroupLeftSection>left-section</InputGroupLeftSection>
          <Input data-testid="input" />
          <InputGroupRightSection>right-section</InputGroupRightSection>
          <InputGroupRightAddon>right-addon</InputGroupRightAddon>
        </InputGroup>
      </FormControl>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("disabled");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-disabled");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-disabled");
    expect(screen.getByText("left-section")).toHaveAttribute("data-disabled");
    expect(screen.getByText("right-section")).toHaveAttribute("data-disabled");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-disabled");
  });

  it("should forward the 'isReadOnly' prop to input, sections and addons", () => {
    render(() => (
      <InputGroup data-testid="input-group" isReadOnly>
        <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
        <InputGroupLeftSection>left-section</InputGroupLeftSection>
        <Input data-testid="input" />
        <InputGroupRightSection>right-section</InputGroupRightSection>
        <InputGroupRightAddon>right-addon</InputGroupRightAddon>
      </InputGroup>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("readonly");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-readonly");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-readonly");
    expect(screen.getByText("left-section")).toHaveAttribute("data-readonly");
    expect(screen.getByText("right-section")).toHaveAttribute("data-readonly");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-readonly");
  });

  it("should forward the 'isReadOnly' prop from a form control", () => {
    render(() => (
      <FormControl isReadOnly>
        <InputGroup data-testid="input-group">
          <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
          <InputGroupLeftSection>left-section</InputGroupLeftSection>
          <Input data-testid="input" />
          <InputGroupRightSection>right-section</InputGroupRightSection>
          <InputGroupRightAddon>right-addon</InputGroupRightAddon>
        </InputGroup>
      </FormControl>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("readonly");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-readonly");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-readonly");
    expect(screen.getByText("left-section")).toHaveAttribute("data-readonly");
    expect(screen.getByText("right-section")).toHaveAttribute("data-readonly");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-readonly");
  });

  it("should forward the 'isInvalid' prop to input, sections and addons", () => {
    render(() => (
      <InputGroup data-testid="input-group" isInvalid>
        <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
        <InputGroupLeftSection>left-section</InputGroupLeftSection>
        <Input data-testid="input" />
        <InputGroupRightSection>right-section</InputGroupRightSection>
        <InputGroupRightAddon>right-addon</InputGroupRightAddon>
      </InputGroup>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-invalid");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-invalid");
    expect(screen.getByText("left-section")).toHaveAttribute("data-invalid");
    expect(screen.getByText("right-section")).toHaveAttribute("data-invalid");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-invalid");
  });

  it("should forward the 'isInvalid' prop from a form control", () => {
    render(() => (
      <FormControl isInvalid>
        <InputGroup data-testid="input-group">
          <InputGroupLeftAddon>left-addon</InputGroupLeftAddon>
          <InputGroupLeftSection>left-section</InputGroupLeftSection>
          <Input data-testid="input" />
          <InputGroupRightSection>right-section</InputGroupRightSection>
          <InputGroupRightAddon>right-addon</InputGroupRightAddon>
        </InputGroup>
      </FormControl>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("input-group")).toHaveAttribute("data-invalid");
    expect(screen.getByText("left-addon")).toHaveAttribute("data-invalid");
    expect(screen.getByText("left-section")).toHaveAttribute("data-invalid");
    expect(screen.getByText("right-section")).toHaveAttribute("data-invalid");
    expect(screen.getByText("right-addon")).toHaveAttribute("data-invalid");
  });
});
