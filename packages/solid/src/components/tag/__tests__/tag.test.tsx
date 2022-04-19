import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../test-utils";
import { Tag } from "../tag";
import { tagStyles, TagVariants } from "../tag.styles";

describe("Tag", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

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
      // eslint-disable-next-line solid/no-react-specific-props
      <Tag data-testid="tag" className={stubClass}>
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

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: TagVariants = {
      variant: "subtle",
      colorScheme: "success",
      size: "lg",
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
});
