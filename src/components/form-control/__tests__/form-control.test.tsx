import { cleanup, fireEvent, screen } from "solid-testing-library";

import { Input } from "@/components/input/input";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { FormControl } from "../form-control";
import { formControlStyles } from "../form-control.styles";
import { FormErrorMessage } from "../form-error-message";
import { FormHelperText } from "../form-helper-text";
import { FormLabel } from "../form-label";

describe("FormControl", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control">
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control">
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control" as="span">
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toBeInstanceOf(HTMLSpanElement);
  });

  it("should create underlying elements ids based on 'id' prop", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl id="name" invalid>
        <FormLabel data-testid="label">Name</FormLabel>
        <Input data-testid="input" />
        <FormHelperText data-testid="helper-text">Enter a name</FormHelperText>
        <FormErrorMessage data-testid="error-message">Name is required</FormErrorMessage>
      </FormControl>
    ));

    const input = screen.getByTestId("input");
    const label = screen.getByTestId("label");
    const helperText = screen.getByTestId("helper-text");
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(input).toHaveAttribute("id", "name");
    expect(label).toHaveAttribute("id", "name-label");
    expect(helperText).toHaveAttribute("id", "name-helper-text");
    expect(errorMessage).toHaveAttribute("id", "name-error-message");
  });

  it("should create underlying elements ids with a generated id when 'id' prop is not set", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormLabel data-testid="label">Name</FormLabel>
        <Input data-testid="input" />
        <FormHelperText data-testid="helper-text">Enter a name</FormHelperText>
        <FormErrorMessage data-testid="error-message">Name is required</FormErrorMessage>
      </FormControl>
    ));

    const input = screen.getByTestId("input");
    const label = screen.getByTestId("label");
    const helperText = screen.getByTestId("helper-text");
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(input).toHaveAttribute("id", expect.stringMatching(/^hope-field-(.+)/));
    expect(label).toHaveAttribute("id", `${input.id}-label`);
    expect(helperText).toHaveAttribute("id", `${input.id}-helper-text`);
    expect(errorMessage).toHaveAttribute("id", `${input.id}-error-message`);
  });

  it("should calls provided input callbacks", async () => {
    // arrange
    const onFocus = jest.fn();
    const onBlur = jest.fn();

    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control" as="span">
        <FormLabel>Name</FormLabel>
        <Input data-testid="input" placeholder="Name" onFocus={onFocus} onBlur={onBlur} />
      </FormControl>
    ));
    const input = screen.getByTestId("input");

    fireEvent.focus(input);
    fireEvent.blur(input);

    // assert
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
  });

  it("should have 'role=group' attribute", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control">
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toHaveAttribute("role", "group");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control">
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toHaveClass("hope-form-control");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(FormControl.toString()).toBe(".hope-form-control");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control" class={stubClass}>
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <FormControl data-testid="control" className={stubClass}>
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control" classList={{ [stubClass]: true }}>
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toHaveClass(stubClass);
  });

  it("should have stitches generated class from formControlStyles", () => {
    // arrange
    const formControlClass = formControlStyles();

    // act
    renderWithHopeProvider(() => (
      <FormControl data-testid="control">
        <FormLabel>Name</FormLabel>
        <Input />
        <FormHelperText>Enter a name</FormHelperText>
        <FormErrorMessage>Name is required</FormErrorMessage>
      </FormControl>
    ));
    const control = screen.getByTestId("control");

    // assert
    expect(control).toHaveClass(formControlClass.className);
  });
});
