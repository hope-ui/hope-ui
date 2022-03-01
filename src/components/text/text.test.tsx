import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { Text, TextProps } from "./text";
import { textStyles } from "./text.styles";

describe("Text", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

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
      // eslint-disable-next-line solid/no-react-specific-props
      <Text data-testid="text" className={stubClass}>
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

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const props: TextProps<"p"> = {
      size: "4xl",
    };

    const textClass = textStyles(props);

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
});
