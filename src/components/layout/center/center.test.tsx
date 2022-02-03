import { cleanup, screen } from "solid-testing-library";

import { StyleProps } from "@/styled-system";
import { createStyledSystemClass } from "@/styled-system/system";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { Center } from "./center";
import { centerStyles } from "./center.styles";

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
      <Center data-testid="center" class={stubClass}>
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

  it("should have stitches generated class from style props", () => {
    // arrange
    const styleProps: StyleProps = {
      p: "$4",
      color: "white",
      bg: "tomato",
      css: {
        transition: "all 300ms ease-in",
      },
    };
    const className = createStyledSystemClass(styleProps).className;

    // act
    renderWithHopeProvider(() => (
      <Center data-testid="center" {...styleProps}>
        Center
      </Center>
    ));
    const center = screen.getByTestId("center");

    // assert
    expect(center).toHaveClass(className);
  });
});
