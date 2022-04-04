import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { alertTitleStyles } from "../alert.styles";
import { AlertTitle } from "../alert-title";

describe("AlertTitle", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <AlertTitle data-testid="alert-title">AlertTitle</AlertTitle>);
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <AlertTitle data-testid="alert-title">AlertTitle</AlertTitle>);
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <AlertTitle data-testid="alert-title" as="p">
        AlertTitle
      </AlertTitle>
    ));
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toBeInstanceOf(HTMLParagraphElement);
  });

  it("should render children", () => {
    // arrange
    const children = "AlertTitle";

    // act
    renderWithHopeProvider(() => <AlertTitle data-testid="alert-title">{children}</AlertTitle>);
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <AlertTitle data-testid="alert-title">AlertTitle</AlertTitle>);
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toHaveClass("hope-alert__title");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(AlertTitle.toString()).toBe(".hope-alert__title");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <AlertTitle data-testid="alert-title" class={stubClass}>
        AlertTitle
      </AlertTitle>
    ));
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <AlertTitle data-testid="alert-title" className={stubClass}>
        AlertTitle
      </AlertTitle>
    ));
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <AlertTitle data-testid="alert-title" classList={{ [stubClass]: true }}>
        AlertTitle
      </AlertTitle>
    ));
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toHaveClass(stubClass);
  });

  it("should have stitches generated class from alertTitleStyles", () => {
    // arrange
    const alertTitleClass = alertTitleStyles();

    // act
    renderWithHopeProvider(() => <AlertTitle data-testid="alert-title">Text</AlertTitle>);
    const alertTitle = screen.getByTestId("alert-title");

    // assert
    expect(alertTitle).toHaveClass(alertTitleClass.className);
  });
});
