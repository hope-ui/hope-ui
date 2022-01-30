import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test";

import { BaseFlexOptions } from "../Flex/Flex";
import { baseFlexStyles } from "../Flex/Flex.styles";
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

  it("should have stitches generated class from baseFlexStyles", () => {
    // arrange
    const stackClass = baseFlexStyles();

    // act
    renderWithHopeProvider(() => <Stack data-testid="stack">Stack</Stack>);
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass(stackClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: BaseFlexOptions = {
      direction: "column-reverse",
      wrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: "6",
    };

    const stackClass = baseFlexStyles({
      ...variantProps,
      flexDirection: variantProps.direction,
      flexWrap: variantProps.wrap,
    });

    // act
    renderWithHopeProvider(() => (
      <Stack data-testid="stack" {...variantProps}>
        Stack
      </Stack>
    ));
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass(stackClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const stackClass = baseFlexStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Stack data-testid="stack" css={customCSS}>
        Stack
      </Stack>
    ));
    const stack = screen.getByTestId("stack");

    // assert
    expect(stack).toHaveClass(stackClass.className);
  });
});

describe("VStack", () => {
  afterEach(cleanup);

  it("should have flexDirection set to column", () => {
    // arrange

    const stackClass = baseFlexStyles({
      flexDirection: "column",
    });

    // act
    renderWithHopeProvider(() => <VStack data-testid="v-stack">VStack</VStack>);
    const vStack = screen.getByTestId("v-stack");

    // assert
    expect(vStack).toHaveClass(stackClass.className);
  });

  it("should pass spacing prop to <Stack /> rowGap prop", () => {
    // arrange
    const variantProps: VStackOptions = {
      spacing: "4",
    };

    const stackClass = baseFlexStyles({
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
    expect(vStack).toHaveClass(stackClass.className);
  });
});

describe("HStack", () => {
  afterEach(cleanup);

  it("should have flexDirection set to row", () => {
    // arrange

    const stackClass = baseFlexStyles({
      flexDirection: "row",
    });

    // act
    renderWithHopeProvider(() => <HStack data-testid="h-stack">HStack</HStack>);
    const hStack = screen.getByTestId("h-stack");

    // assert
    expect(hStack).toHaveClass(stackClass.className);
  });

  it("should pass spacing prop to <Stack /> columnGap prop", () => {
    // arrange
    const variantProps: HStackOptions = {
      spacing: "4",
    };

    const stackClass = baseFlexStyles({
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
    expect(hStack).toHaveClass(stackClass.className);
  });
});
