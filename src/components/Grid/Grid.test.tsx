import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test";

import { Grid, GridOptions } from "./Grid";
import { gridStyles } from "./Grid.styles";

describe("Grid", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Grid data-testid="grid">Grid</Grid>);
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Grid data-testid="grid">Grid</Grid>);
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Grid data-testid="grid" as="span">
        Grid
      </Grid>
    ));
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Grid";

    // act
    renderWithHopeProvider(() => <Grid data-testid="grid">{children}</Grid>);
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Grid data-testid="grid">Grid</Grid>);
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass("hope-grid");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Grid.toString()).toBe(".hope-grid");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Grid data-testid="grid" class={stubClass}>
        Grid
      </Grid>
    ));
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Grid data-testid="grid" class={stubClass}>
        Grid
      </Grid>
    ));
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Grid data-testid="grid" classList={{ [stubClass]: true }}>
        Grid
      </Grid>
    ));
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass(stubClass);
  });

  it("should have stitches generated class from gridStyles", () => {
    // arrange
    const gridClass = gridStyles();

    // act
    renderWithHopeProvider(() => <Grid data-testid="grid">Grid</Grid>);
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass(gridClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: GridOptions = {
      autoFlow: "column",
      autoColumns: "fr",
      autoRows: "max",
      rows: "4",
      columns: "12",
    };
    const gridClass = gridStyles({
      ...variantProps,
      gridAutoFlow: variantProps.autoFlow,
      gridAutoColumns: variantProps.autoColumns,
      gridAutoRows: variantProps.autoRows,
      gridTemplateColumns: variantProps.columns,
      gridTemplateRows: variantProps.rows,
    });

    // act
    renderWithHopeProvider(() => (
      <Grid data-testid="grid" {...variantProps}>
        Grid
      </Grid>
    ));
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass(gridClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const gridClass = gridStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Grid data-testid="grid" css={customCSS}>
        Grid
      </Grid>
    ));
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass(gridClass.className);
  });
});
