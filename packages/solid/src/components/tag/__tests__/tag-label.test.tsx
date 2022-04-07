import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../../../utils/test-utils";
import { tagLabelStyles } from "../tag.styles";
import { TagLabel } from "../tag-label";

describe("TagLabel", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <TagLabel data-testid="tag-label">TagLabel</TagLabel>);
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toBeInTheDocument();
  });

  it("should render <span> tag by default", () => {
    // act
    renderWithHopeProvider(() => <TagLabel data-testid="tag-label">TagLabel</TagLabel>);
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <TagLabel data-testid="tag-label" as="p">
        TagLabel
      </TagLabel>
    ));
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toBeInstanceOf(HTMLParagraphElement);
  });

  it("should render children", () => {
    // arrange
    const children = "TagLabel";

    // act
    renderWithHopeProvider(() => <TagLabel data-testid="tag-label">{children}</TagLabel>);
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toHaveTextContent(children);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <TagLabel data-testid="tag-label">TagLabel</TagLabel>);
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toHaveClass("hope-tag-label");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(TagLabel.toString()).toBe(".hope-tag-label");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <TagLabel data-testid="tag-label" class={stubClass}>
        TagLabel
      </TagLabel>
    ));
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <TagLabel data-testid="tag-label" className={stubClass}>
        TagLabel
      </TagLabel>
    ));
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <TagLabel data-testid="tag-label" classList={{ [stubClass]: true }}>
        TagLabel
      </TagLabel>
    ));
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toHaveClass(stubClass);
  });

  it("should have stitches generated class from tagLabelStyles", () => {
    // arrange
    const tagLabelClass = tagLabelStyles();

    // act
    renderWithHopeProvider(() => <TagLabel data-testid="tag-label">Tag</TagLabel>);
    const tagLabel = screen.getByTestId("tag-label");

    // assert
    expect(tagLabel).toHaveClass(tagLabelClass.className);
  });
});
