import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { Container } from "./container";
import { containerStyles, ContainerVariants } from "./container.styles";

describe("Container", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Container data-testid="container">Container</Container>);
    const container = screen.getByTestId("container");

    // assert
    expect(container).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Container data-testid="container">Container</Container>);
    const container = screen.getByTestId("container");

    // assert
    expect(container).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Container data-testid="container" as="span">
        Container
      </Container>
    ));
    const container = screen.getByTestId("container");

    // assert
    expect(container).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Container";

    // act
    renderWithHopeProvider(() => <Container data-testid="container">{children}</Container>);
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Container data-testid="container">Container</Container>);
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveClass("hope-container");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Container.toString()).toBe(".hope-container");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Container data-testid="container" class={stubClass}>
        Container
      </Container>
    ));
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Container data-testid="container" className={stubClass}>
        Container
      </Container>
    ));
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Container data-testid="container" classList={{ [stubClass]: true }}>
        Container
      </Container>
    ));
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveClass(stubClass);
  });

  it("should have stitches generated class from containerStyles and variants prop", () => {
    // arrange
    const variantProps: ContainerVariants = {
      centered: true,
      centerContent: true,
    };
    const containerClass = containerStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Container data-testid="container" {...variantProps}>
        Container
      </Container>
    ));
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveClass(containerClass.className);
  });
});
