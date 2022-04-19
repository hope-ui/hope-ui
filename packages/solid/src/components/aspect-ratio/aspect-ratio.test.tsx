import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../test-utils";
import { AspectRatio } from "./aspect-ratio";
import { aspectRatioStyles } from "./aspect-ratio.styles";

describe("AspectRatio", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <AspectRatio data-testid="aspect-ratio">AspectRatio</AspectRatio>);
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <AspectRatio data-testid="aspect-ratio">AspectRatio</AspectRatio>);
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <AspectRatio data-testid="aspect-ratio" as="span">
        AspectRatio
      </AspectRatio>
    ));
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "AspectRatio";

    // act
    renderWithHopeProvider(() => <AspectRatio data-testid="aspect-ratio">{children}</AspectRatio>);
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <AspectRatio data-testid="aspect-ratio">AspectRatio</AspectRatio>);
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toHaveClass("hope-aspect-ratio");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(AspectRatio.toString()).toBe(".hope-aspect-ratio");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <AspectRatio data-testid="aspect-ratio" class={stubClass}>
        AspectRatio
      </AspectRatio>
    ));
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <AspectRatio data-testid="aspect-ratio" className={stubClass}>
        AspectRatio
      </AspectRatio>
    ));
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <AspectRatio data-testid="aspect-ratio" classList={{ [stubClass]: true }}>
        AspectRatio
      </AspectRatio>
    ));
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toHaveClass(stubClass);
  });

  it("should have stitches generated class from aspectRatioStyles", () => {
    // arrange
    const aspectRatioClass = aspectRatioStyles();

    // act
    renderWithHopeProvider(() => <AspectRatio data-testid="aspect-ratio">AspectRatio</AspectRatio>);
    const aspectRatio = screen.getByTestId("aspect-ratio");

    // assert
    expect(aspectRatio).toHaveClass(aspectRatioClass.className);
  });
});
