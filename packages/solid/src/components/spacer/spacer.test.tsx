import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../test-utils";
import { Spacer } from "./spacer";
import { spacerStyles } from "./spacer.styles";

describe("Spacer", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Spacer data-testid="spacer">Spacer</Spacer>);
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Spacer data-testid="spacer">Spacer</Spacer>);
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Spacer data-testid="spacer" as="span">
        Spacer
      </Spacer>
    ));
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Spacer";

    // act
    renderWithHopeProvider(() => <Spacer data-testid="spacer">{children}</Spacer>);
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Spacer data-testid="spacer">Spacer</Spacer>);
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveClass("hope-spacer");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Spacer.toString()).toBe(".hope-spacer");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Spacer data-testid="spacer" class={stubClass}>
        Spacer
      </Spacer>
    ));
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Spacer data-testid="spacer" className={stubClass}>
        Spacer
      </Spacer>
    ));
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Spacer data-testid="spacer" classList={{ [stubClass]: true }}>
        Spacer
      </Spacer>
    ));
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveClass(stubClass);
  });

  it("should have stitches generated class from spacerStyles", () => {
    // arrange
    const spacerClass = spacerStyles();

    // act
    renderWithHopeProvider(() => <Spacer data-testid="spacer">Spacer</Spacer>);
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveClass(spacerClass.className);
  });
});
