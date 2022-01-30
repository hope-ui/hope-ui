import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/renderWithHopeProvider";

import { BaseTextOptions, Text } from "./Text";
import { baseTextStyles } from "./Text.styles";

describe("Text", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Text data-testid="text">Text</Text>);
    const text = screen.getByTestId("text");

    // assert
    expect(text).toBeInTheDocument();
  });

  it("should render <p> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Text data-testid="text">Text</Text>);
    const text = screen.getByTestId("text");

    // assert
    expect(text).toBeInstanceOf(HTMLParagraphElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Text data-testid="text" as="span">
        Text
      </Text>
    ));
    const text = screen.getByTestId("text");

    // assert
    expect(text).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Text";

    // act
    renderWithHopeProvider(() => <Text data-testid="text">{children}</Text>);
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Text data-testid="text">Text</Text>);
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveClass("hope-text");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Text.toString()).toBe(".hope-text");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Text data-testid="text" class={stubClass}>
        Text
      </Text>
    ));
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Text data-testid="text" class={stubClass}>
        Text
      </Text>
    ));
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Text data-testid="text" classList={{ [stubClass]: true }}>
        Text
      </Text>
    ));
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveClass(stubClass);
  });

  it("should have stitches generated class from textStyles", () => {
    // arrange
    const textClass = baseTextStyles();

    // act
    renderWithHopeProvider(() => <Text data-testid="text">Text</Text>);
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveClass(textClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const props: BaseTextOptions = {
      color: "primary500",
      size: "4xl",
      fontFamily: "serif",
      fontWeight: "light",
      textAlign: "justify",
      lineClamp: 3,
    };

    const textClass = baseTextStyles(props);

    // act
    renderWithHopeProvider(() => (
      <Text data-testid="text" {...props}>
        Text
      </Text>
    ));
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveClass(textClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const textClass = baseTextStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Text data-testid="text" css={customCSS}>
        Text
      </Text>
    ));
    const text = screen.getByTestId("text");

    // assert
    expect(text).toHaveClass(textClass.className);
  });
});
