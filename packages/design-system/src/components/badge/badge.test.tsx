import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../test-utils";
import { Badge } from "./badge";
import { badgeStyles, BadgeVariants } from "./badge.styles";

describe("Badge", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toBeInTheDocument();
  });

  it("should render <span> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Badge data-testid="badge" as="div">
        Badge
      </Badge>
    ));
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toBeInstanceOf(HTMLDivElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Badge";

    // act
    renderWithHopeProvider(() => <Badge data-testid="badge">{children}</Badge>);
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Badge data-testid="badge">Badge</Badge>);
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toHaveClass("hope-badge");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Badge.toString()).toBe(".hope-badge");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Badge data-testid="badge" class={stubClass}>
        Badge
      </Badge>
    ));
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Badge data-testid="badge" className={stubClass}>
        Badge
      </Badge>
    ));
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Badge data-testid="badge" classList={{ [stubClass]: true }}>
        Badge
      </Badge>
    ));
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toHaveClass(stubClass);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: BadgeVariants = {
      variant: "subtle",
      colorScheme: "success",
    };
    const badgeClass = badgeStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Badge data-testid="badge" {...variantProps}>
        Badge
      </Badge>
    ));
    const badge = screen.getByTestId("badge");

    // assert
    expect(badge).toHaveClass(badgeClass.className);
  });
});
