import { cleanup, screen } from "solid-testing-library";

import { FormErrorMessage, FormHelperText } from "@/components";
import { FormControl } from "@/components/form-control/form-control";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { Input } from "../input";
import { baseInputResetStyles, inputStyles } from "../input.styles";

describe("Input", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Input data-testid="input" />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toBeInTheDocument();
  });

  it("should render <input> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Input data-testid="input" />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toBeInstanceOf(HTMLInputElement);
  });

  it("should have default id from FormControl", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <Input data-testid="input" />
      </FormControl>
    ));
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("id", expect.stringMatching(/^hope-field-(.+)/));
  });

  it("should have 'aria-required' and 'required' attribute when FormControl is required", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl required>
        <Input data-testid="input" />
      </FormControl>
    ));
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("should have 'disabled' attribute when FormControl is disabled", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl disabled>
        <Input data-testid="input" />
      </FormControl>
    ));
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("disabled");
  });

  it("should have 'aria-invalid' attribute when FormControl is invalid", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <Input data-testid="input" />
      </FormControl>
    ));
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should have 'aria-readonly' and 'readOnly' attribute when FormControl is readOnly", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl readOnly>
        <Input data-testid="input" />
      </FormControl>
    ));
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("readOnly");
    expect(input).toHaveAttribute("aria-readonly", "true");
  });

  it("should have 'aria-describedby' attribute with FormHelperText id generated from FormControl", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <Input data-testid="input" />
        <FormHelperText data-testid="helper-text">Helper text</FormHelperText>
      </FormControl>
    ));
    const input = screen.getByTestId("input");
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(input).toHaveAttribute("aria-describedby", helperText.id);
  });

  it("should have 'aria-describedby' attribute with FormErrorMessage id first when FormControl is invalid", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <Input data-testid="input" />
        <FormHelperText data-testid="helper-text">Helper text</FormHelperText>
        <FormErrorMessage data-testid="error-message">Error message</FormErrorMessage>
      </FormControl>
    ));
    const input = screen.getByTestId("input");
    const helperText = screen.getByTestId("helper-text");
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(input).toHaveAttribute("aria-describedby", `${errorMessage.id} ${helperText.id}`);
  });

  it("should have 'aria-required' and 'required' attribute when Input is required", () => {
    // act
    renderWithHopeProvider(() => <Input data-testid="input" required />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("should have 'disabled' attribute when Input is disabled", () => {
    // act
    renderWithHopeProvider(() => <Input data-testid="input" disabled />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("disabled");
  });

  it("should have 'aria-invalid' attribute when Input is invalid", () => {
    // act
    renderWithHopeProvider(() => <Input data-testid="input" invalid />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should have 'aria-readonly' and 'readOnly' attribute when Input is readOnly", () => {
    // act
    renderWithHopeProvider(() => <Input data-testid="input" readOnly />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveAttribute("readOnly");
    expect(input).toHaveAttribute("aria-readonly", "true");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Input data-testid="input" />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveClass("hope-input");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Input.toString()).toBe(".hope-input");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Input data-testid="input" class={stubClass} />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    // eslint-disable-next-line solid/no-react-specific-props
    renderWithHopeProvider(() => <Input data-testid="input" className={stubClass} />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Input data-testid="input" classList={{ [stubClass]: true }} />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveClass(stubClass);
  });

  it("should have stitches generated class from baseInputResetStyles and inputStyles", () => {
    // arrange
    const baseInputResetClass = baseInputResetStyles();
    const inputClass = inputStyles();

    // act
    renderWithHopeProvider(() => <Input data-testid="input" />);
    const input = screen.getByTestId("input");

    // assert
    expect(input).toHaveClass(baseInputResetClass.className);
    expect(input).toHaveClass(inputClass.className);
  });
});
