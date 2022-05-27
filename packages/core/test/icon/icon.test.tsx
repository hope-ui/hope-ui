import { cleanup, screen } from "solid-testing-library";

import { createIcon, Icon } from "../../src";
import { renderWithHopeProvider } from "../render";

const StubIcon = createIcon({
  viewBox: "0 0 15 15",
  path: () => (
    <path
      d="M5 7.5C5 7.22386 5.22386 7 5.5 7H9.5C9.77614 7 10 7.22386 10 7.5C10 7.77614 9.77614 8 9.5 8H5.5C5.22386 8 5 7.77614 5 7.5Z"
      fill="currentColor"
      fill-rule="evenodd"
      clip-rule="evenodd"
    />
  ),
});

describe("Icon", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Icon data-testid="icon" as={StubIcon} />);
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toBeInTheDocument();
  });

  it("should render <svg> tag with children", () => {
    // arrange
    const path = (
      <g fill="none">
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1zm4 8a4 4 0 1 1-8 0a4 4 0 0 1 8 0zm-.464 4.95l.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 1.414zm2.12-10.607a1 1 0 0 1 0 1.414l-.706.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM17 11a1 1 0 1 0 0-2h-1a1 1 0 1 0 0 2h1zm-7 4a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zM5.05 6.464A1 1 0 1 0 6.465 5.05l-.708-.707a1 1 0 0 0-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414zM4 11a1 1 0 1 0 0-2H3a1 1 0 0 0 0 2h1z"
          fill="currentColor"
        ></path>
      </g>
    );

    // act
    renderWithHopeProvider(() => (
      <Icon data-testid="icon" viewBox="0 0 20 20">
        {path}
      </Icon>
    ));

    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toBeInstanceOf(SVGElement);
    expect(icon.querySelector("g")).toBe(path);
  });

  it("should have 'hope-icon' class", () => {
    // act
    renderWithHopeProvider(() => <Icon data-testid="icon" as={StubIcon} />);
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass("hope-icon");
  });

  it("should accept class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Icon class={stubClass} data-testid="icon" as={StubIcon} />);
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass(stubClass);
  });

  it("should accept classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Icon classList={{ [stubClass]: true }} data-testid="icon" as={StubIcon} />
    ));
    const icon = screen.getByTestId("icon");

    // assert
    expect(icon).toHaveClass(stubClass);
  });
});
