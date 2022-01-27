import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/test/utils";

import { Container } from "./Container";
import { containerStyles, ContainerVariants } from "./Container.styles";

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

  it("should have stitches generated class from containerStyles", () => {
    // arrange
    const containerClass = containerStyles();

    // act
    renderWithHopeProvider(() => <Container data-testid="container">Container</Container>);
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveClass(containerClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
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

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const containerClass = containerStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Container data-testid="container" css={customCSS}>
        Container
      </Container>
    ));
    const container = screen.getByTestId("container");

    // assert
    expect(container).toHaveClass(containerClass.className);
  });
});
