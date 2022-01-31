import { cleanup, screen } from "solid-testing-library";

import { styledSystemStyles } from "@/styled-system";
import { renderWithHopeProvider } from "@/utils/testUtils";

import { GridItem, GridItemOptions } from "./GridItem";

describe("GridItem", () => {
  afterEach(cleanup);

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
      <GridItem data-testid="grid-item" class={stubClass}>
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

  it("should have stitches generated class from shorthand props", () => {
    // arrange
    const shorthandProps: GridItemOptions = {
      colSpan: "4",
      colStart: "1",
      colEnd: "5",
      rowSpan: "4",
      rowStart: "1",
      rowEnd: "5",
    };
    const styledSystemClass = styledSystemStyles({
      gridColumnSpan: shorthandProps.colSpan,
      gridColumnStart: shorthandProps.colStart,
      gridColumnEnd: shorthandProps.colEnd,
      gridRowSpan: shorthandProps.rowSpan,
      gridRowStart: shorthandProps.rowStart,
      gridRowEnd: shorthandProps.rowEnd,
    });

    // act
    renderWithHopeProvider(() => (
      <GridItem data-testid="grid-item" {...shorthandProps}>
        GridItem
      </GridItem>
    ));
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass(styledSystemClass.className);
  });
});
