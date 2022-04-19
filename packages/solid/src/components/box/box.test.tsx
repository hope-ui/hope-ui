import { cleanup, screen } from "solid-testing-library";

import { createStyledSystemClass } from "../../styled-system/system";
import { StyleProps } from "../../styled-system/types";
import { renderWithHopeProvider } from "../test-utils";
import { Box } from "./box";

describe("Box", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Box data-testid="box">Box</Box>);
    const box = screen.getByTestId("box");

    // assert
    expect(box).toBeInTheDocument();
  });

  it("should render <div> tag by default", () => {
    // act
    renderWithHopeProvider(() => <Box data-testid="box">Box</Box>);
    const box = screen.getByTestId("box");

    // assert
    expect(box).toBeInstanceOf(HTMLDivElement);
  });

  it("should render tag provided with the as prop", () => {
    // act
    renderWithHopeProvider(() => (
      <Box data-testid="box" as="span">
        Box
      </Box>
    ));
    const box = screen.getByTestId("box");

    // assert
    expect(box).toBeInstanceOf(HTMLSpanElement);
  });

  it("should render children", () => {
    // arrange
    const children = "Box";

    // act
    renderWithHopeProvider(() => <Box data-testid="box">{children}</Box>);
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveTextContent(children);
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Box data-testid="box" class={stubClass}>
        Box
      </Box>
    ));
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Box data-testid="box" className={stubClass}>
        Box
      </Box>
    ));
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      <Box data-testid="box" classList={{ [stubClass]: true }}>
        Box
      </Box>
    ));
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveClass(stubClass);
  });

  it("should have stitches generated class from style props", () => {
    // arrange
    const styleProps: StyleProps = {
      p: "$4",
      color: "white",
      bg: "tomato",
      css: {
        transition: "all 300ms ease-in",
      },
    };
    const className = createStyledSystemClass(styleProps).className;

    // act
    renderWithHopeProvider(() => (
      <Box data-testid="box" {...styleProps}>
        Box
      </Box>
    ));
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveClass(className);
  });
});
