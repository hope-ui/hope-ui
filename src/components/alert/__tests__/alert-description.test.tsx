import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { alertDescriptionStyles } from "../alert.styles";
import { AlertDescription } from "../alert-description";

describe("AlertDescription", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <AlertDescription data-testid="alert-description">AlertDescription</AlertDescription>);
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <AlertDescription data-testid="alert-description">AlertDescription</AlertDescription>);
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <AlertDescription data-testid="alert-description" as="p">
        AlertDescription
      </AlertDescription>
    ));
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toBeInstanceOf(HTMLParagraphElement);
  });

  it("should render children", () => {
    // arrange
    const children = "AlertDescription";

    // act
    renderWithHopeProvider(() => <AlertDescription data-testid="alert-description">{children}</AlertDescription>);
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <AlertDescription data-testid="alert-description">AlertDescription</AlertDescription>);
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toHaveClass("hope-alert__description");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(AlertDescription.toString()).toBe(".hope-alert__description");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <AlertDescription data-testid="alert-description" class={stubClass}>
        AlertDescription
      </AlertDescription>
    ));
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <AlertDescription data-testid="alert-description" className={stubClass}>
        AlertDescription
      </AlertDescription>
    ));
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <AlertDescription data-testid="alert-description" classList={{ [stubClass]: true }}>
        AlertDescription
      </AlertDescription>
    ));
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toHaveClass(stubClass);
  });

  it("should have stitches generated class from alertDescriptionStyles", () => {
    // arrange
    const alertDescriptionClass = alertDescriptionStyles();

    // act
    renderWithHopeProvider(() => <AlertDescription data-testid="alert-description">Text</AlertDescription>);
    const alertDescription = screen.getByTestId("alert-description");

    // assert
    expect(alertDescription).toHaveClass(alertDescriptionClass.className);
  });
});
