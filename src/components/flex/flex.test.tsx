import { cleanup, screen } from "solid-testing-library";

import { css } from "@/styled-system";
import * as styledSystem from "@/styled-system/system";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { Flex, FlexOptions } from "./flex";

describe("Flex", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Flex data-testid="flex">Flex</Flex>);
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Flex data-testid="flex">Flex</Flex>);
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Flex data-testid="flex" as="span">
        Flex
      </Flex>
    ));
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Flex";

    // act
    renderWithHopeProvider(() => <Flex data-testid="flex">{children}</Flex>);
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Flex data-testid="flex">Flex</Flex>);
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toHaveClass("hope-flex");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Flex.toString()).toBe(".hope-flex");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Flex data-testid="flex" class={stubClass}>
        Flex
      </Flex>
    ));
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Flex data-testid="flex" className={stubClass}>
        Flex
      </Flex>
    ));
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Flex data-testid="flex" classList={{ [stubClass]: true }}>
        Flex
      </Flex>
    ));
    const flex = screen.getByTestId("flex");

    // assert
    expect(flex).toHaveClass(stubClass);
  });

  it("should have display props to 'flex' by default", () => {
    // arrange
    const stubClassName = css({})();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <Flex>Flex</Flex>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        display: "flex",
      }),
      undefined
    );
  });

  it("should renders all the allowed shorthand style props", () => {
    // arrange
    const shorthandProps: FlexOptions = {
      direction: "column-reverse",
      wrap: "wrap",
    };

    const stubClassName = css({})();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <Flex {...shorthandProps}>Flex</Flex>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        flexDirection: shorthandProps.direction,
        flexWrap: shorthandProps.wrap,
      }),
      undefined
    );
  });
});
