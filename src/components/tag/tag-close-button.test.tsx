import { JSX } from "solid-js";
import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { tagCloseButtonStyles } from "./tag.styles";
import { TagCloseButton } from "./tag-close-button";
import { TagProvider } from "./tag-provider";

function renderWithTagContextProvider(callback: () => JSX.Element) {
  return renderWithHopeProvider(() => (
    <TagProvider contextValue={{ borderRadius: "md" }}>{callback}</TagProvider>
  ));
}
describe("TagCloseButton", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithTagContextProvider(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInTheDocument();
  });

  it("should render <button> tag by default", () => {
    // act
    renderWithTagContextProvider(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInstanceOf(HTMLButtonElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithTagContextProvider(() => <TagCloseButton as="a" aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInstanceOf(HTMLAnchorElement);
  });

  it("should have type=button", () => {
    // act
    renderWithTagContextProvider(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveAttribute("type", "button");
  });

  it("should have role=button", () => {
    // act
    renderWithTagContextProvider(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveAttribute("role", "button");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithTagContextProvider(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass("hope-tag-close-button");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(TagCloseButton.toString()).toBe(".hope-tag-close-button");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithTagContextProvider(() => <TagCloseButton class={stubClass} aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithTagContextProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <TagCloseButton className={stubClass} aria-label="Close" />
    ));
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithTagContextProvider(() => (
      <TagCloseButton classList={{ [stubClass]: true }} aria-label="Close" />
    ));
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have stitches generated class from tagCloseButtonStyles", () => {
    // arrange
    const tagCloseButtonClass = tagCloseButtonStyles();

    // act
    renderWithTagContextProvider(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(tagCloseButtonClass.className);
  });
});
