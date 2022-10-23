import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { Input } from "../input";
import { FormControl, FormControlProps } from "./form-control";
import { FormControlDescription } from "./form-control-description";
import { FormControlError } from "./form-control-error";
import { FormControlLabel } from "./form-control-label";

const defaultProps: FormControlProps = {};

describe("FormControl", () => {
  itIsPolymorphic(FormControl as any, defaultProps);
  itRendersChildren(FormControl as any, defaultProps);
  itSupportsClass(FormControl as any, defaultProps);
  itHasSemanticClass(FormControl as any, defaultProps, "hope-FormControl-root");
  itSupportsRef(FormControl as any, defaultProps, HTMLDivElement);
  itSupportsStyle(FormControl as any, defaultProps);

  it("should have 'role=group' attribute", () => {
    render(() => <FormControl data-testid="control" />);

    const control = screen.getByTestId("control");

    expect(control).toHaveAttribute("role", "group");
  });

  it("should forward the 'isRequired' prop to label, description and error", () => {
    render(() => (
      <FormControl data-testid="control" isRequired>
        <FormControlLabel>label</FormControlLabel>
        <FormControlDescription>description</FormControlDescription>
        <FormControlError>error</FormControlError>
      </FormControl>
    ));

    expect(screen.getByTestId("control")).toHaveAttribute("data-required");
    expect(screen.getByText("label")).toHaveAttribute("data-required");
    expect(screen.getByText("description")).toHaveAttribute("data-required");
    expect(screen.getByText("error")).toHaveAttribute("data-required");
  });

  it("should forward the 'isDisabled' prop to label, description and error", () => {
    render(() => (
      <FormControl data-testid="control" isDisabled>
        <FormControlLabel>label</FormControlLabel>
        <FormControlDescription>description</FormControlDescription>
        <FormControlError>error</FormControlError>
      </FormControl>
    ));

    expect(screen.getByTestId("control")).toHaveAttribute("data-disabled");
    expect(screen.getByText("label")).toHaveAttribute("data-disabled");
    expect(screen.getByText("description")).toHaveAttribute("data-disabled");
    expect(screen.getByText("error")).toHaveAttribute("data-disabled");
  });

  it("should forward the 'isReadOnly' prop to label, description and error", () => {
    render(() => (
      <FormControl data-testid="control" isReadOnly>
        <FormControlLabel>label</FormControlLabel>
        <FormControlDescription>description</FormControlDescription>
        <FormControlError>error</FormControlError>
      </FormControl>
    ));

    expect(screen.getByTestId("control")).toHaveAttribute("data-readonly");
    expect(screen.getByText("label")).toHaveAttribute("data-readonly");
    expect(screen.getByText("description")).toHaveAttribute("data-readonly");
    expect(screen.getByText("error")).toHaveAttribute("data-readonly");
  });

  it("should forward the 'isInvalid' prop to label, description and error", () => {
    render(() => (
      <FormControl data-testid="control" isInvalid>
        <FormControlLabel>label</FormControlLabel>
        <FormControlDescription>description</FormControlDescription>
        <FormControlError>error</FormControlError>
      </FormControl>
    ));

    expect(screen.getByTestId("control")).toHaveAttribute("data-invalid");
    expect(screen.getByText("label")).toHaveAttribute("data-invalid");
    expect(screen.getByText("description")).toHaveAttribute("data-invalid");
    expect(screen.getByText("error")).toHaveAttribute("data-invalid");
  });

  it("should create underlying elements ids with a generated id", () => {
    render(() => (
      <FormControl>
        <FormControlLabel>label</FormControlLabel>
        <Input data-testid="input" />
        <FormControlDescription>description</FormControlDescription>
        <FormControlError>error</FormControlError>
      </FormControl>
    ));

    const input = screen.getByTestId("input");

    expect(input).toHaveAttribute("id", expect.stringMatching(/^hope-form-control-(.+)/));
    expect(screen.getByText("label")).toHaveAttribute("id", `${input.id}-label`);
    expect(screen.getByText("description")).toHaveAttribute("id", `${input.id}-description`);
    expect(screen.getByText("error")).toHaveAttribute("id", `${input.id}-error`);
  });

  it("should create underlying elements ids based on 'id' prop", () => {
    render(() => (
      <FormControl id="test">
        <FormControlLabel>label</FormControlLabel>
        <Input data-testid="input" />
        <FormControlDescription>description</FormControlDescription>
        <FormControlError>error</FormControlError>
      </FormControl>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute("id", "test");
    expect(screen.getByText("label")).toHaveAttribute("id", "test-label");
    expect(screen.getByText("description")).toHaveAttribute("id", "test-description");
    expect(screen.getByText("error")).toHaveAttribute("id", "test-error");
  });

  it("should not add error id to 'aria-describedby' when form control is not invalid", () => {
    render(() => (
      <FormControl>
        <FormControlLabel>label</FormControlLabel>
        <Input data-testid="input" />
        <FormControlDescription>description</FormControlDescription>
        <FormControlError>error</FormControlError>
      </FormControl>
    ));

    expect(screen.getByTestId("input")).toHaveAttribute(
      "aria-describedby",
      screen.getByText("description")!.id
    );
  });
});

describe("FormControlLabel", () => {
  itIsPolymorphic(FormControlLabel as any, {}, ".hope-FormControl-label", FormControl);
  itRendersChildren(FormControlLabel as any, {}, FormControl);
  itSupportsClass(FormControlLabel as any, {}, FormControl);
  itHasSemanticClass(FormControlLabel as any, {}, "hope-FormControl-label", FormControl);
  itSupportsRef(FormControlLabel as any, {}, HTMLLabelElement, undefined, FormControl);
  itSupportsStyle(FormControlLabel as any, {}, ".hope-FormControl-label", FormControl);
});

describe("FormControlDescription", () => {
  itIsPolymorphic(FormControlDescription as any, {}, ".hope-FormControl-description", FormControl);
  itRendersChildren(FormControlDescription as any, {}, FormControl);
  itSupportsClass(FormControlDescription as any, {}, FormControl);
  itHasSemanticClass(
    FormControlDescription as any,
    {},
    "hope-FormControl-description",
    FormControl
  );
  itSupportsRef(FormControlDescription as any, {}, HTMLDivElement, undefined, FormControl);
  itSupportsStyle(FormControlDescription as any, {}, ".hope-FormControl-description", FormControl);
});

describe("FormControlError", () => {
  itIsPolymorphic(FormControlError as any, {}, ".hope-FormControl-error", FormControl);
  itRendersChildren(FormControlError as any, {}, FormControl);
  itSupportsClass(FormControlError as any, {}, FormControl);
  itHasSemanticClass(FormControlError as any, {}, "hope-FormControl-error", FormControl);
  itSupportsRef(FormControlError as any, {}, HTMLDivElement, undefined, FormControl);
  itSupportsStyle(FormControlError as any, {}, ".hope-FormControl-error", FormControl);
});
