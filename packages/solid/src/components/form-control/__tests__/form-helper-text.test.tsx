import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../../utils/test-utils";
import { FormControl } from "../form-control";
import { formHelperTextStyles } from "../form-control.styles";
import { FormHelperText } from "../form-helper-text";

describe("FormHelperText", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormHelperText data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormHelperText data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormHelperText as="span" data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toBeInstanceOf(HTMLSpanElement);
  });

  it("should have default id from FormControl", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl id="email">
        <FormHelperText data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveAttribute("id", "email-helper-text");
  });

  it("should have 'data-disabled' attribute when FormControl is disabled", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl disabled>
        <FormHelperText data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveAttribute("data-disabled");
  });

  it("should have 'data-readonly' attribute when FormControl is readOnly", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl readOnly>
        <FormHelperText data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveAttribute("data-readonly");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormHelperText data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveClass("hope-form-helper-text");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(FormHelperText.toString()).toBe(".hope-form-helper-text");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormHelperText data-testid="helper-text" class={stubClass} />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <FormHelperText data-testid="helper-text" className={stubClass} />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormHelperText data-testid="helper-text" classList={{ [stubClass]: true }} />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveClass(stubClass);
  });

  it("should have stitches generated class from formHelperTextStyles", () => {
    // arrange
    const formHelperTextClass = formHelperTextStyles();

    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormHelperText data-testid="helper-text" />
      </FormControl>
    ));
    const helperText = screen.getByTestId("helper-text");

    // assert
    expect(helperText).toHaveClass(formHelperTextClass.className);
  });
});
