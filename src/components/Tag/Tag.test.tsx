import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test";

import { Tag, TagOptions } from "./Tag";
import { tagStyles } from "./Tag.styles";

describe("Tag", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Tag data-testid="tag">Tag</Tag>);
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toBeInTheDocument();
  });

  it("should render <span> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Tag data-testid="tag">Tag</Tag>);
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Tag data-testid="tag" as="div">
        Tag
      </Tag>
    ));
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toBeInstanceOf(HTMLDivElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Tag";

    // act
    renderWithHopeProvider(() => <Tag data-testid="tag">{children}</Tag>);
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Tag data-testid="tag">Tag</Tag>);
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveClass("hope-tag");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Tag.toString()).toBe(".hope-tag");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Tag data-testid="tag" class={stubClass}>
        Tag
      </Tag>
    ));
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Tag data-testid="tag" class={stubClass}>
        Tag
      </Tag>
    ));
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Tag data-testid="tag" classList={{ [stubClass]: true }}>
        Tag
      </Tag>
    ));
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveClass(stubClass);
  });

  it("should have stitches generated class from tagStyles", () => {
    // arrange
    const tagClass = tagStyles();

    // act
    renderWithHopeProvider(() => <Tag data-testid="tag">Tag</Tag>);
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveClass(tagClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: TagOptions = {
      variant: "subtle",
      colorScheme: "success",
      size: "lg",
      borderRadius: "md",
    };
    const tagClass = tagStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Tag data-testid="tag" {...variantProps}>
        Tag
      </Tag>
    ));
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveClass(tagClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const tagClass = tagStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Tag data-testid="tag" css={customCSS}>
        Tag
      </Tag>
    ));
    const tag = screen.getByTestId("tag");

    // assert
    expect(tag).toHaveClass(tagClass.className);
  });
});
