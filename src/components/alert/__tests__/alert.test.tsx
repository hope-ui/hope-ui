import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../../utils/test-utils";
import { Alert } from "../alert";
import { alertStyles, AlertVariants } from "../alert.styles";

describe("Alert", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Alert data-testid="alert">Alert</Alert>);
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toBeInTheDocument();
  });

  it("should render <div> alert by default", () => {
    // act
    renderWithHopeProvider(() => <Alert data-testid="alert">Alert</Alert>);
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toBeInstanceOf(HTMLDivElement);
  });

  it("should render alert provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Alert data-testid="alert" as="span">
        Alert
      </Alert>
    ));
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Alert";

    // act
    renderWithHopeProvider(() => <Alert data-testid="alert">{children}</Alert>);
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toHaveTextContent(children);
  });

  it("should have role=alert", () => {
    // act
    renderWithHopeProvider(() => <Alert data-testid="alert">Alert</Alert>);
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toHaveAttribute("role", "alert");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Alert data-testid="alert">Alert</Alert>);
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toHaveClass("hope-alert");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Alert.toString()).toBe(".hope-alert");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Alert data-testid="alert" class={stubClass}>
        Alert
      </Alert>
    ));
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Alert data-testid="alert" className={stubClass}>
        Alert
      </Alert>
    ));
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Alert data-testid="alert" classList={{ [stubClass]: true }}>
        Alert
      </Alert>
    ));
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toHaveClass(stubClass);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: AlertVariants = {
      status: "success",
      variant: "subtle",
    };
    const alertClass = alertStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Alert data-testid="alert" {...variantProps}>
        Alert
      </Alert>
    ));
    const alert = screen.getByTestId("alert");

    // assert
    expect(alert).toHaveClass(alertClass.className);
  });
});
