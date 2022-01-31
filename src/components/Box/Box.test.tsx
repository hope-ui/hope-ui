import { cleanup, screen } from "solid-testing-library";

import { styledSystemStyles, StyledSystemVariants } from "@/styled-system";
import { renderWithHopeProvider } from "@/utils/testUtils";

import { Box } from "./Box";

describe("Box", () => {
  afterEach(cleanup);

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
      <Box data-testid="box" class={stubClass}>
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

  it("should have stitches generated class from boxStyles", () => {
    // arrange
    const boxClass = styledSystemStyles();

    // act
    renderWithHopeProvider(() => <Box data-testid="box">Box</Box>);
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveClass(boxClass.className);
  });

  it("should have stitches generated class from variants prop", () => {
    // arrange
    const variantProps: Required<StyledSystemVariants> = {
      display: "block",
      verticalAlign: "baseline",
      overflow: "auto",
      overflowX: "clip",
      overflowY: "scroll",
      color: "white",
      bg: "success500",
      borderWidth: "4",
      borderStyle: "double",
      borderColor: "primary500",
      borderRadius: "md",
      fontFamily: "sans",
      fontSize: "5xl",
      fontWeight: "bold",
      fontStyle: "italic",
      lineHeight: "6",
      letterSpacing: "wide",
      textAlign: "center",
      textTransform: "capitalize",
      lineClamp: "5",
      m: "4",
      mx: "4",
      my: "4",
      mt: "4",
      mr: "4",
      mb: "4",
      ml: "4",
      p: "4",
      px: "4",
      py: "4",
      pt: "4",
      pr: "4",
      pb: "4",
      pl: "4",
      gap: "4",
      rowGap: "4",
      columnGap: "4",
      w: "md",
      minW: "md",
      maxW: "md",
      h: "md",
      minH: "md",
      maxH: "md",
      boxSize: "md",
      boxShadow: "md",
      position: "fixed",
      zIndex: "auto",
      top: "4",
      right: "4",
      bottom: "4",
      left: "4",
      flex: "auto",
      flexDirection: "column",
      flexWrap: "wrap",
      flexGrow: "0",
      flexShrink: "1",
      order: "first",
      alignItems: "center",
      alignContent: "center",
      alignSelf: "center",
      justifyItems: "center",
      justifyContent: "center",
      justifySelf: "center",
      placeItems: "center",
      placeContent: "center",
      placeSelf: "center",
      gridAutoFlow: "column",
      gridAutoColumns: "auto",
      gridAutoRows: "auto",
      gridTemplateColumns: "4",
      gridTemplateRows: "4",
      gridColumnSpan: "4",
      gridColumnStart: "4",
      gridColumnEnd: "4",
      gridRowSpan: "4",
      gridRowStart: "4",
      gridRowEnd: "4",
    };
    const boxClass = styledSystemStyles(variantProps);

    // act
    renderWithHopeProvider(() => (
      <Box data-testid="box" {...variantProps}>
        Box
      </Box>
    ));
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveClass(boxClass.className);
  });

  it("should have stitches generated class from css prop", () => {
    // arrange
    const customCSS = { bg: "red" };
    const boxClass = styledSystemStyles({ css: customCSS });

    // act
    renderWithHopeProvider(() => (
      <Box data-testid="box" css={customCSS}>
        Box
      </Box>
    ));
    const box = screen.getByTestId("box");

    // assert
    expect(box).toHaveClass(boxClass.className);
  });
});
