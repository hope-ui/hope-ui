import { cleanup, screen } from "solid-testing-library";

import { styledSystemStyles } from "@/styled-system";
import { renderWithHopeProvider } from "@/utils/testUtils";

import { Grid, GridOptions } from "./Grid";

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

  it("should have stitches generated class from shorthand props", () => {
    // arrange
    const shorthandProps: GridOptions = {
      autoFlow: "column",
      autoColumns: "fr",
      autoRows: "max",
      rows: "4",
      columns: "12",
    };
    const styledSystemClass = styledSystemStyles({
      gridAutoFlow: shorthandProps.autoFlow,
      gridAutoColumns: shorthandProps.autoColumns,
      gridAutoRows: shorthandProps.autoRows,
      gridTemplateColumns: shorthandProps.columns,
      gridTemplateRows: shorthandProps.rows,
    });

    // act
    renderWithHopeProvider(() => (
      <Grid data-testid="grid" {...shorthandProps}>
        Grid
      </Grid>
    ));
    const grid = screen.getByTestId("grid");

    // assert
    expect(grid).toHaveClass(styledSystemClass.className);
  });
});
