import { JSX } from "solid-js";
import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../test-utils";
import { Tag } from "../tag";
import { tagCloseButtonStyles } from "../tag.styles";
import { TagCloseButton } from "../tag-close-button";

function renderWithTagContext(callback: () => JSX.Element) {
  return renderWithHopeProvider(() => <Tag>{callback()}</Tag>);
}

describe("TagCloseButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithTagContext(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInTheDocument();
  });

  it("should render <button> tag by default", () => {
    // act
    renderWithTagContext(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInstanceOf(HTMLButtonElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithTagContext(() => <TagCloseButton as="a" aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInstanceOf(HTMLAnchorElement);
  });

  it("should have type=button", () => {
    // act
    renderWithTagContext(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveAttribute("type", "button");
  });

  it("should have role=button", () => {
    // act
    renderWithTagContext(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveAttribute("role", "button");
  });

  it("should have semantic hope class", () => {
    // act
    renderWithTagContext(() => <TagCloseButton aria-label="Close" />);
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
    renderWithTagContext(() => <TagCloseButton class={stubClass} aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithTagContext(() => (
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
    renderWithTagContext(() => <TagCloseButton classList={{ [stubClass]: true }} aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(stubClass);
  });

  it("should have stitches generated class from tagCloseButtonStyles", () => {
    // arrange
    const tagCloseButtonClass = tagCloseButtonStyles();

    // act
    renderWithTagContext(() => <TagCloseButton aria-label="Close" />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toHaveClass(tagCloseButtonClass.className);
  });
});
