import { JSX } from "solid-js";
import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../test-utils";
import { Alert } from "../alert";
import { alertIconStyles } from "../alert.styles";
import { AlertIcon } from "../alert-icon";

function renderWithAlertContext(callback: () => JSX.Element) {
  return renderWithHopeProvider(() => <Alert status="success">{callback}</Alert>);
}

describe("AlertIcon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithAlertContext(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toBeInTheDocument();
  });

  it("should render content provided by the 'as' prop", () => {
    // act
    renderWithAlertContext(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toBeInstanceOf(SVGElement);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithAlertContext(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass("hope-alert__icon");
  });

  it("should return semantic hope class of <Icon/> as css selector when calling toString()", () => {
    expect(AlertIcon.toString()).toBe(".hope-alert__icon");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAlertContext(() => <AlertIcon data-testid="alert-icon" class={stubClass} />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAlertContext(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <AlertIcon data-testid="alert-icon" className={stubClass} />
    ));
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAlertContext(() => (
      <AlertIcon data-testid="alert-icon" classList={{ [stubClass]: true }} />
    ));
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass(stubClass);
  });

  it("should have stitches generated class from alertIconStyles", () => {
    // arrange
    const alertIconClass = alertIconStyles();

    // act
    renderWithAlertContext(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass(alertIconClass.className);
  });
});
