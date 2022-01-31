import { cleanup, screen } from "solid-testing-library";

import { styledSystemStyles } from "@/styled-system";
import { renderWithHopeProvider } from "@/utils/testUtils";

import { BaseFlexOptions } from "../Flex/Flex";
import { HStack, HStackOptions, Stack, VStack, VStackOptions } from "./Stack";

describe("Stack", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Stack data-testid="stack">Stack</Stack>);
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Stack data-testid="stack">Stack</Stack>);
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Stack data-testid="stack" as="span">
        Stack
      </Stack>
    ));
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Stack";

    // act
    renderWithHopeProvider(() => <Stack data-testid="stack">{children}</Stack>);
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Stack data-testid="stack">Stack</Stack>);
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass("hope-stack");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Stack.toString()).toBe(".hope-stack");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Stack data-testid="stack" class={stubClass}>
        Stack
      </Stack>
    ));
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Stack data-testid="stack" class={stubClass}>
        Stack
      </Stack>
    ));
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Stack data-testid="stack" classList={{ [stubClass]: true }}>
        Stack
      </Stack>
    ));
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass(stubClass);
  });

  it("should have stitches generated class from shorthand props", () => {
    // arrange
    const shorthandProps: BaseFlexOptions = {
      direction: "column-reverse",
      wrap: "wrap",
    };

    const styledSystemClass = styledSystemStyles({
      flexDirection: shorthandProps.direction,
      flexWrap: shorthandProps.wrap,
    });

    // act
    renderWithHopeProvider(() => (
      <Stack data-testid="stack" {...shorthandProps}>
        Stack
      </Stack>
    ));
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass(styledSystemClass.className);
  });
});

describe("VStack", () => {
  afterEach(cleanup);

  it("should have flexDirection set to column", () => {
    // arrange

    const styledSystemClass = styledSystemStyles({
      flexDirection: "column",
    });

    // act
    renderWithHopeProvider(() => <VStack data-testid="v-stack">VStack</VStack>);
    const vStack = screen.getByTestId("v-stack");

    // assert
    expect(vStack).toHaveClass(styledSystemClass.className);
  });

  it("should pass spacing prop to <Stack /> rowGap prop", () => {
    // arrange
    const variantProps: VStackOptions = {
      spacing: "4",
    };

    const styledSystemClass = styledSystemStyles({
      rowGap: variantProps.spacing,
    });

    // act
    renderWithHopeProvider(() => (
      <VStack data-testid="v-stack" {...variantProps}>
        VStack
      </VStack>
    ));
    const vStack = screen.getByTestId("v-stack");

    // assert
    expect(vStack).toHaveClass(styledSystemClass.className);
  });
});

describe("HStack", () => {
  afterEach(cleanup);

  it("should have flexDirection set to row", () => {
    // arrange

    const styledSystemClass = styledSystemStyles({
      flexDirection: "row",
    });

    // act
    renderWithHopeProvider(() => <HStack data-testid="h-stack">HStack</HStack>);
    const hStack = screen.getByTestId("h-stack");

    // assert
    expect(hStack).toHaveClass(styledSystemClass.className);
  });

  it("should pass spacing prop to <Stack /> columnGap prop", () => {
    // arrange
    const variantProps: HStackOptions = {
      spacing: "4",
    };

    const styledSystemClass = styledSystemStyles({
      columnGap: variantProps.spacing,
    });

    // act
    renderWithHopeProvider(() => (
      <HStack data-testid="h-stack" {...variantProps}>
        HStack
      </HStack>
    ));
    const hStack = screen.getByTestId("h-stack");

    // assert
    expect(hStack).toHaveClass(styledSystemClass.className);
  });
});
