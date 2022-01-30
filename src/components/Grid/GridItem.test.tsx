import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test";

import { gridItemStyles } from "./Grid.styles";
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

  it("should have stitches generated class from gridItemStyles", () => {
    // arrange
    const gridItemClass = gridItemStyles();

    // act
    renderWithHopeProvider(() => <GridItem data-testid="grid-item">GridItem</GridItem>);
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass(gridItemClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: GridItemOptions = {
      gridColumnSpan: "4",
      gridColumnStart: "1",
      gridColumnEnd: "5",
      gridRowSpan: "4",
      gridRowStart: "1",
      gridRowEnd: "5",
    };
    const gridItemClass = gridItemStyles({
      ...variantProps,
      gridColumnSpan: variantProps.colSpan,
      gridColumnStart: variantProps.colStart,
      gridColumnEnd: variantProps.colEnd,
      gridRowSpan: variantProps.rowSpan,
      gridRowStart: variantProps.rowStart,
      gridRowEnd: variantProps.rowEnd,
    });

    // act
    renderWithHopeProvider(() => (
      <GridItem data-testid="grid-item" {...variantProps}>
        GridItem
      </GridItem>
    ));
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass(gridItemClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const gridItemClass = gridItemStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <GridItem data-testid="grid-item" css={customCSS}>
        GridItem
      </GridItem>
    ));
    const gridItem = screen.getByTestId("grid-item");

    // assert
    expect(gridItem).toHaveClass(gridItemClass.className);
  });
});
