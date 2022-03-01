import { JSX } from "solid-js";
import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { alertIconStyles } from "../alert.styles";
import { AlertIcon } from "../alert-icon";
import { AlertProvider } from "../alert-provider";

function renderWithAlertContextProvider(callback: () => JSX.Element) {
  return renderWithHopeProvider(() => <AlertProvider status="success">{callback}</AlertProvider>);
}

describe("AlertIcon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithAlertContextProvider(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toBeInTheDocument();
  });

  it("should render content provided by the 'as' prop", () => {
    // act
    renderWithAlertContextProvider(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toBeInstanceOf(SVGElement);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithAlertContextProvider(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass("hope-alert-icon");
  });

  it("should return semantic hope class of <Icon/> as css selector when calling toString()", () => {
    expect(AlertIcon.toString()).toBe(".hope-alert-icon");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAlertContextProvider(() => <AlertIcon data-testid="alert-icon" class={stubClass} />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithAlertContextProvider(() => (
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
    renderWithAlertContextProvider(() => <AlertIcon data-testid="alert-icon" classList={{ [stubClass]: true }} />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass(stubClass);
  });

  it("should have stitches generated class from alertIconStyles", () => {
    // arrange
    const alertIconClass = alertIconStyles();

    // act
    renderWithAlertContextProvider(() => <AlertIcon data-testid="alert-icon" />);
    const alertIcon = screen.getByTestId("alert-icon");

    // assert
    expect(alertIcon).toHaveClass(alertIconClass.className);
  });
});
