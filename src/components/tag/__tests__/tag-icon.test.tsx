import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { IconUser } from "../../icons/IconUser";
import { tagLeftIconStyles, tagRightIconStyles } from "../tag.styles";
import { TagLeftIcon, TagRightIcon } from "../tag-icon";

describe("TagLeftIcon", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <TagLeftIcon data-testid="tag-left-icon" as={IconUser} />);
    const tagLeftIcon = screen.getByTestId("tag-left-icon");

    // assert
    expect(tagLeftIcon).toBeInTheDocument();
  });

  it("should render content provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => <TagLeftIcon data-testid="tag-left-icon" as={IconUser} />);
    const tagLeftIcon = screen.getByTestId("tag-left-icon");

    // assert
    expect(tagLeftIcon).toBeInstanceOf(SVGElement);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <TagLeftIcon data-testid="tag-left-icon" as={IconUser} />);
    const tagLeftIcon = screen.getByTestId("tag-left-icon");

    // assert
    expect(tagLeftIcon).toHaveClass("hope-tag-left-icon");
  });

  it("should return semantic hope class of <Icon/> as css selector when calling toString()", () => {
    expect(TagLeftIcon.toString()).toBe(".hope-tag-left-icon");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <TagLeftIcon data-testid="tag-left-icon" class={stubClass} as={IconUser} />);
    const tagLeftIcon = screen.getByTestId("tag-left-icon");

    // assert
    expect(tagLeftIcon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <TagLeftIcon data-testid="tag-left-icon" className={stubClass} as={IconUser} />
    ));
    const tagLeftIcon = screen.getByTestId("tag-left-icon");

    // assert
    expect(tagLeftIcon).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <TagLeftIcon data-testid="tag-left-icon" classList={{ [stubClass]: true }} as={IconUser} />
    ));
    const tagLeftIcon = screen.getByTestId("tag-left-icon");

    // assert
    expect(tagLeftIcon).toHaveClass(stubClass);
  });

  it("should have stitches generated class from tagLeftIconStyles", () => {
    // arrange
    const tagLeftIconClass = tagLeftIconStyles();

    // act
    renderWithHopeProvider(() => <TagLeftIcon data-testid="tag-left-icon" as={IconUser} />);
    const tagLeftIcon = screen.getByTestId("tag-left-icon");

    // assert
    expect(tagLeftIcon).toHaveClass(tagLeftIconClass.className);
  });
});

describe("TagRightIcon", () => {
  afterEach(cleanup);

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <TagRightIcon data-testid="tag-right-icon" as={IconUser} />);
    const tagRightIcon = screen.getByTestId("tag-right-icon");

    // assert
    expect(tagRightIcon).toBeInTheDocument();
  });

  it("should render content provided by the 'as' prop", () => {
    // act
    renderWithHopeProvider(() => <TagRightIcon data-testid="tag-right-icon" as={IconUser} />);
    const tagRightIcon = screen.getByTestId("tag-right-icon");

    // assert
    expect(tagRightIcon).toBeInstanceOf(SVGElement);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <TagRightIcon data-testid="tag-right-icon" as={IconUser} />);
    const tagRightIcon = screen.getByTestId("tag-right-icon");

    // assert
    expect(tagRightIcon).toHaveClass("hope-tag-right-icon");
  });

  it("should return semantic hope class of <Icon/> as css selector when calling toString()", () => {
    expect(TagRightIcon.toString()).toBe(".hope-tag-right-icon");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <TagRightIcon data-testid="tag-right-icon" class={stubClass} as={IconUser} />);
    const tagRightIcon = screen.getByTestId("tag-right-icon");

    // assert
    expect(tagRightIcon).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <TagRightIcon data-testid="tag-right-icon" className={stubClass} as={IconUser} />
    ));
    const tagRightIcon = screen.getByTestId("tag-right-icon");

    // assert
    expect(tagRightIcon).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <TagRightIcon data-testid="tag-right-icon" classList={{ [stubClass]: true }} as={IconUser} />
    ));
    const tagRightIcon = screen.getByTestId("tag-right-icon");

    // assert
    expect(tagRightIcon).toHaveClass(stubClass);
  });

  it("should have stitches generated class from tagRightIconStyles", () => {
    // arrange
    const tagRightIconClass = tagRightIconStyles();

    // act
    renderWithHopeProvider(() => <TagRightIcon data-testid="tag-right-icon" as={IconUser} />);
    const tagRightIcon = screen.getByTestId("tag-right-icon");

    // assert
    expect(tagRightIcon).toHaveClass(tagRightIconClass.className);
  });
});
