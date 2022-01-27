import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/renderWithHopeProvider";

import { Center } from "./Center";
import { centerStyles, CenterVariants } from "./Center.styles";

describe("Center", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Center data-testid="center">Center</Center>);
    const center = screen.getByTestId("center");

    // assert
    expect(center).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Center data-testid="center">Center</Center>);
    const center = screen.getByTestId("center");

    // assert
    expect(center).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Center data-testid="center" as="span">
        Center
      </Center>
    ));
    const center = screen.getByTestId("center");

    // assert
    expect(center).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Center";

    // act
    renderWithHopeProvider(() => <Center data-testid="center">{children}</Center>);
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Center data-testid="center">Center</Center>);
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass("hope-center");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Center.toString()).toBe(".hope-center");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Center data-testid="center" class={stubClass}>
        Center
      </Center>
    ));
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Center data-testid="center" className={stubClass}>
        Center
      </Center>
    ));
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Center data-testid="center" classList={{ [stubClass]: true }}>
        Center
      </Center>
    ));
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass(stubClass);
  });

  it("should have stitches generated class from centerStyles", () => {
    // arrange
    const centerClass = centerStyles();

    // act
    renderWithHopeProvider(() => <Center data-testid="center">Center</Center>);
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass(centerClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: CenterVariants = {
      fullHeight: true,
      fullWidth: true,
      fullSize: true,
    };
    const centerClass = centerStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Center data-testid="center" {...variantProps}>
        Center
      </Center>
    ));
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass(centerClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const centerClass = centerStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Center data-testid="center" css={customCSS}>
        Center
      </Center>
    ));
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass(centerClass.className);
  });
});
