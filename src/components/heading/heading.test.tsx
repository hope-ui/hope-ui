import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { Heading, HeadingProps } from "./heading";
import { headingStyles } from "./heading.styles";

describe("Heading", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Heading data-testid="heading">Heading</Heading>);
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toBeInTheDocument();
  });

  it("should render <h2> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Heading data-testid="heading">Heading</Heading>);
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toBeInstanceOf(HTMLHeadingElement);
  });

  it("should render <h> tag based on the level prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Heading data-testid="heading" level="3">
        Heading
      </Heading>
    ));
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toBeInstanceOf(HTMLHeadingElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Heading data-testid="heading" as="span">
        Heading
      </Heading>
    ));
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Heading";

    // act
    renderWithHopeProvider(() => <Heading data-testid="heading">{children}</Heading>);
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Heading data-testid="heading">Heading</Heading>);
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toHaveClass("hope-heading");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Heading.toString()).toBe(".hope-heading");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Heading data-testid="heading" class={stubClass}>
        Heading
      </Heading>
    ));
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Heading data-testid="heading" class={stubClass}>
        Heading
      </Heading>
    ));
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Heading data-testid="heading" classList={{ [stubClass]: true }}>
        Heading
      </Heading>
    ));
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toHaveClass(stubClass);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: HeadingProps<"h2"> = {
      size: "4xl",
    };

    const headingClass = headingStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Heading data-testid="heading" {...variantProps}>
        Heading
      </Heading>
    ));
    const heading = screen.getByTestId("heading");

    // assert
    expect(heading).toHaveClass(headingClass.className);
  });
});
