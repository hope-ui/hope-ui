import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/test/utils";
import { defaultTheme } from "@/theme/defaultTheme";

import { Button } from "./Button";
import { buttonStyles, ButtonVariants } from "./Button.styles";

describe("Button", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toBeInTheDocument();
  });

  it("should render <button> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toBeInstanceOf(HTMLButtonElement);
  });

  it("should render tag provided with as prop", () => {
    // act
    renderWithHopeProvider(() => <Button as="a">Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toBeInstanceOf(HTMLAnchorElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Button";

    // act
    renderWithHopeProvider(() => <Button as="a">{children}</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveTextContent(children);
  });

  it("should have type=button", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveAttribute("type", "button");
  });

  it("should have role=button", () => {
    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveAttribute("role", "button");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Button class={stubClass}>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Button className={stubClass}>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Button classList={{ [stubClass]: true }}>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have stitches generated class from Button theme by default", () => {
    // arrange
    const buttonClass = buttonStyles(defaultTheme.components.Button);

    // act
    renderWithHopeProvider(() => <Button>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveClass(buttonClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: ButtonVariants = {
      variant: "light",
      color: "success",
      size: "lg",
      radius: "md",
      uppercase: true,
      compact: true,
      loading: false,
      fullWidth: false,
    };
    const buttonClass = buttonStyles(variantProps);

    // act
    renderWithHopeProvider(() => <Button {...variantProps}>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveClass(buttonClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const buttonClass = buttonStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => <Button css={customCSS}>Button</Button>);
    const button = screen.getByTestId("hope-button");

    // assert
    expect(button).toHaveClass(buttonClass.className);
  });
});
