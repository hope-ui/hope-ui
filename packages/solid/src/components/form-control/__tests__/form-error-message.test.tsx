import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../test-utils";
import { FormControl } from "../form-control";
import { formErrorMessageStyles } from "../form-control.styles";
import { FormErrorMessage } from "../form-error-message";

describe("FormErrorMessage", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should NOT render when FormControl is valid", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.queryByTestId("error-message");

    // assert
    expect(errorMessage).not.toBeInTheDocument();
  });

  it("should render when FormControl is invalid", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormErrorMessage as="span" data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toBeInstanceOf(HTMLSpanElement);
  });

  it("should have default id from FormControl", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl id="email" invalid>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveAttribute("id", "email-error-message");
  });

  it("should have 'data-disabled' attribute when FormControl is disabled", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid disabled>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveAttribute("data-disabled");
  });

  it("should have 'data-readonly' attribute when FormControl is readOnly", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid readOnly>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveAttribute("data-readonly");
  });

  it("should have 'aria-live=polite' attribute", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid readOnly>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveAttribute("aria-live", "polite");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveClass("hope-form-error-message");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(FormErrorMessage.toString()).toBe(".hope-form-error-message");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormErrorMessage data-testid="error-message" class={stubClass} />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        {/* eslint-disable-next-line solid/no-react-specific-props */}
        <FormErrorMessage data-testid="error-message" className={stubClass} />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormErrorMessage data-testid="error-message" classList={{ [stubClass]: true }} />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveClass(stubClass);
  });

  it("should have stitches generated class from formErrorMessageStyles", () => {
    // arrange
    const formErrorMessageClass = formErrorMessageStyles();

    // act
    renderWithHopeProvider(() => (
      <FormControl invalid>
        <FormErrorMessage data-testid="error-message" />
      </FormControl>
    ));
    const errorMessage = screen.getByTestId("error-message");

    // assert
    expect(errorMessage).toHaveClass(formErrorMessageClass.className);
  });
});
