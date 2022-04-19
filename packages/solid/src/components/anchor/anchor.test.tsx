import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../test-utils";
import { Anchor } from "./anchor";
import { anchorStyles } from "./anchor.styles";

describe("Anchor", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Anchor data-testid="anchor">Anchor</Anchor>);
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toBeInTheDocument();
  });

  it("should render <a> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Anchor data-testid="anchor">Anchor</Anchor>);
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toBeInstanceOf(HTMLAnchorElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Anchor data-testid="anchor" as="span">
        Anchor
      </Anchor>
    ));
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Anchor";

    // act
    renderWithHopeProvider(() => <Anchor data-testid="anchor">{children}</Anchor>);
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Anchor data-testid="anchor">Anchor</Anchor>);
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveClass("hope-anchor");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Anchor.toString()).toBe(".hope-anchor");
  });

  it("should have target '_blank' when external", () => {
    // act
    renderWithHopeProvider(() => (
      <Anchor data-testid="anchor" external>
        Anchor
      </Anchor>
    ));
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveAttribute("target", "_blank");
  });

  it("should have rel 'noopener noreferrer' when external", () => {
    // act
    renderWithHopeProvider(() => (
      <Anchor data-testid="anchor" external>
        Anchor
      </Anchor>
    ));
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Anchor data-testid="anchor" class={stubClass}>
        Anchor
      </Anchor>
    ));
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Anchor data-testid="anchor" className={stubClass}>
        Anchor
      </Anchor>
    ));
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Anchor data-testid="anchor" classList={{ [stubClass]: true }}>
        Anchor
      </Anchor>
    ));
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveClass(stubClass);
  });

  it("should have stitches generated class from anchorStyles", () => {
    // arrange
    const anchorClass = anchorStyles();

    // act
    renderWithHopeProvider(() => <Anchor data-testid="anchor">Anchor</Anchor>);
    const anchor = screen.getByTestId("anchor");

    // assert
    expect(anchor).toHaveClass(anchorClass.className);
  });
});
