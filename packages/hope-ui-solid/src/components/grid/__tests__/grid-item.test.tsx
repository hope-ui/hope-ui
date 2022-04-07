import { cleanup, screen } from "solid-testing-library";

import { css } from "../../../styled-system";
import * as styledSystem from "../../../styled-system/system";
import { renderWithHopeProvider } from "../../../utils/test-utils";
import { GridItem, GridItemOptions } from "../grid-item";

describe("GridItem", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <GridItem data-testid="grid-item">GridItem</GridItem>);
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <GridItem data-testid="grid-item">GridItem</GridItem>);
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <GridItem data-testid="grid-item" as="span">
        GridItem
      </GridItem>
    ));
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "GridItem";

    // act
    renderWithHopeProvider(() => <GridItem data-testid="grid-item">{children}</GridItem>);
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <GridItem data-testid="grid-item">GridItem</GridItem>);
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass("hope-grid-item");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(GridItem.toString()).toBe(".hope-grid-item");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <GridItem data-testid="grid-item" class={stubClass}>
        GridItem
      </GridItem>
    ));
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <GridItem data-testid="grid-item" className={stubClass}>
        GridItem
      </GridItem>
    ));
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <GridItem data-testid="grid-item" classList={{ [stubClass]: true }}>
        GridItem
      </GridItem>
    ));
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass(stubClass);
  });

  it("should renders all the allowed shorthand style props", () => {
    // arrange
    const shorthandProps: GridItemOptions = {
      area: "a",
      colSpan: "full",
      colStart: "1",
      colEnd: "5",
      rowSpan: "4",
      rowStart: "1",
      rowEnd: "5",
    };

    const stubClassName = css({})();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <GridItem {...shorthandProps}>GridItem</GridItem>);

    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        gridArea: shorthandProps.area,
        gridColumn: `1 / -1`, // beacause colSpan is `full`
        gridColumnStart: shorthandProps.colStart,
        gridColumnEnd: shorthandProps.colEnd,
        gridRow: `span ${shorthandProps.rowSpan} / span ${shorthandProps.rowSpan}`,
        gridRowStart: shorthandProps.rowStart,
        gridRowEnd: shorthandProps.rowEnd,
      }),
      [undefined, undefined] // __baseStyles
    );
  });
});
