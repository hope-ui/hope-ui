import { cleanup, screen } from "solid-testing-library";

import { css } from "@/styled-system/stitches.config";
import * as styledSystem from "@/styled-system/system";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { HStack, HStackOptions, Stack, VStack, VStackOptions } from "./stack";

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
});

describe("VStack", () => {
  afterEach(cleanup);

  it("should have flexDirection set to column", () => {
    // arrange
    const stubClassName = css()();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <VStack>VStack</VStack>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        flexDirection: "column",
      })
    );
  });

  it("should pass spacing prop to <Stack /> rowGap prop", () => {
    // arrange
    const variantProps: VStackOptions = {
      spacing: "4",
    };

    const stubClassName = css()();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <VStack {...variantProps}>VStack</VStack>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        rowGap: variantProps.spacing,
      })
    );
  });
});

describe("HStack", () => {
  afterEach(cleanup);

  it("should have flexDirection set to row", () => {
    // arrange
    const stubClassName = css()();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <HStack>HStack</HStack>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        flexDirection: "row",
      })
    );
  });

  it("should pass spacing prop to <Stack /> columnGap prop", () => {
    // arrange
    const variantProps: HStackOptions = {
      spacing: "4",
    };

    const stubClassName = css()();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <HStack {...variantProps}>HStack</HStack>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        columnGap: variantProps.spacing,
      })
    );
  });
});
