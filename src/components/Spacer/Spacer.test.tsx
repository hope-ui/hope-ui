import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test";

import { Spacer } from "./Spacer";
import { spacerStyles, SpacerVariants } from "./Spacer.styles";

describe("Spacer", () => {
  afterEach(cleanup);

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
      <Spacer data-testid="spacer" class={stubClass}>
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

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: SpacerVariants = {
      bg: "primary500",
    };
    const spacerClass = spacerStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Spacer data-testid="spacer" {...variantProps}>
        Spacer
      </Spacer>
    ));
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveClass(spacerClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const spacerClass = spacerStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Spacer data-testid="spacer" css={customCSS}>
        Spacer
      </Spacer>
    ));
    const spacer = screen.getByTestId("spacer");

    // assert
    expect(spacer).toHaveClass(spacerClass.className);
  });
});
