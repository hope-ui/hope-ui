import { cleanup, screen } from "solid-testing-library";

import { css } from "@/styled-system";
import * as styledSystem from "@/styled-system/system";
import { renderWithHopeProvider } from "@/utils/test-utils";

import { Grid, GridOptions } from "./grid";

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
      // eslint-disable-next-line solid/no-react-specific-props
      <Grid data-testid="grid" className={stubClass}>
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

  it("should renders all the allowed shorthand style props", () => {
    // arrange
    const shorthandProps: GridOptions = {
      autoFlow: "column",
      autoColumns: "fr",
      autoRows: "max",
      templateAreas: "'a b b' 'a c d'",
      templateColumns: "repeat(12, 1fr)",
      templateRows: "repeat(4, 1fr)",
    };

    const stubClassName = css()();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <Grid {...shorthandProps}>Grid</Grid>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        gridAutoFlow: shorthandProps.autoFlow,
        gridAutoColumns: shorthandProps.autoColumns,
        gridAutoRows: shorthandProps.autoRows,
        gridTemplateAreas: shorthandProps.templateAreas,
        gridTemplateColumns: shorthandProps.templateColumns,
        gridTemplateRows: shorthandProps.templateRows,
      }),
      undefined
    );
  });
});
