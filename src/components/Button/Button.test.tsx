import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test";

import { Button } from "./Button";
import { buttonStyles, ButtonVariants } from "./Button.styles";

describe("Button", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInTheDocument();
  });

  it("should render <button> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInstanceOf(HTMLButtonElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => <Button as="a">Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInstanceOf(HTMLAnchorElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Button";

    // act
    renderWithHopeProvider(() => <Button>{children}</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveTextContent(children);
  });

  it("should have type=button", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveAttribute("type", "button");
  });

  it("should have role=button", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveAttribute("role", "button");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass("hope-button");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Button.toString()).toBe(".hope-button");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Button class={stubClass}>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Button class={stubClass}>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Button classList={{ [stubClass]: true }}>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have stitches generated class from buttonStyles", () => {
    // arrange
    const buttonClass = buttonStyles();

    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(buttonClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: ButtonVariants = {
      variant: "subtle",
      colorScheme: "success",
      size: "lg",
      borderRadius: "md",
      compact: true,
      loading: false,
      fullWidth: false,
    };
    const buttonClass = buttonStyles(variantProps);

    // act
    renderWithHopeProvider(() => <Button {...variantProps}>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(buttonClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const buttonClass = buttonStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => <Button css={customCSS}>Button</Button>);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(buttonClass.className);
  });
});
