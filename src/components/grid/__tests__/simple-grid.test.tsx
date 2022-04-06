import { cleanup, screen } from "solid-testing-library";

import { css } from "../../../styled-system";
import * as styledSystem from "../../../styled-system/system";
import { renderWithHopeProvider } from "../../../utils/test-utils";
import { SimpleGrid, SimpleGridOptions } from "../simple-grid";

describe("SimpleGrid", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <SimpleGrid data-testid="simple-grid">SimpleGrid</SimpleGrid>);
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <SimpleGrid data-testid="simple-grid">SimpleGrid</SimpleGrid>);
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <SimpleGrid data-testid="simple-grid" as="span">
        SimpleGrid
      </SimpleGrid>
    ));
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "SimpleGrid";

    // act
    renderWithHopeProvider(() => <SimpleGrid data-testid="simple-grid">{children}</SimpleGrid>);
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <SimpleGrid data-testid="simple-grid">SimpleGrid</SimpleGrid>);
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toHaveClass("hope-simple-grid");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(SimpleGrid.toString()).toBe(".hope-simple-grid");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <SimpleGrid data-testid="simple-grid" class={stubClass}>
        SimpleGrid
      </SimpleGrid>
    ));
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <SimpleGrid data-testid="simple-grid" className={stubClass}>
        SimpleGrid
      </SimpleGrid>
    ));
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <SimpleGrid data-testid="simple-grid" classList={{ [stubClass]: true }}>
        SimpleGrid
      </SimpleGrid>
    ));
    const simpleGrid = screen.getByTestId("simple-grid");

    // assert
    expect(simpleGrid).toHaveClass(stubClass);
  });

  it("should renders all the allowed shorthand style props", () => {
    // arrange
    const shorthandProps: SimpleGridOptions = {
      autoFlow: "column",
      autoColumns: "fr",
      autoRows: "max",
      templateAreas: "'a b b' 'a c d'",
      templateColumns: "repeat(12, 1fr)",
      templateRows: "repeat(4, 1fr)",
    };

    const stubClassName = css({})();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <SimpleGrid {...shorthandProps}>SimpleGrid</SimpleGrid>);

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
      [undefined, undefined] // __baseStyles
    );
  });

  it("should apply templateColumns styles based on the minChildWidth prop", () => {
    // arrange
    const stubMinChildWitdh = "120px";
    const stubClassName = css({})();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <SimpleGrid minChildWidth={stubMinChildWitdh}>SimpleGrid</SimpleGrid>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        gridTemplateColumns: `repeat(auto-fit, minmax(${stubMinChildWitdh}, 1fr))`,
      }),
      [undefined, undefined] // __baseStyles
    );
  });

  it("should convert minChildWidth number to pixels when applying templateColumns styles", () => {
    // arrange
    const stubMinChildWitdh = 120;
    const stubClassName = css({})();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <SimpleGrid minChildWidth={stubMinChildWitdh}>SimpleGrid</SimpleGrid>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        gridTemplateColumns: `repeat(auto-fit, minmax(${stubMinChildWitdh}px, 1fr))`,
      }),
      [undefined, undefined] // __baseStyles
    );
  });

  it("should apply templateColumns styles based on the columns prop", () => {
    // arrange
    const stubColumns = 12;
    const stubClassName = css({})();

    jest.spyOn(styledSystem, "createStyledSystemClass").mockReturnValue(stubClassName);

    // act
    renderWithHopeProvider(() => <SimpleGrid columns={stubColumns}>SimpleGrid</SimpleGrid>);

    // assert
    expect(styledSystem.createStyledSystemClass).toHaveBeenCalledWith(
      expect.objectContaining({
        gridTemplateColumns: `repeat(${stubColumns}, minmax(0, 1fr))`,
      }),
      [undefined, undefined] // __baseStyles
    );
  });
});
