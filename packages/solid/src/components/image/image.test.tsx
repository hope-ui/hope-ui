import { cleanup, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "../test-utils";
import { Image } from "./image";

const src = "https://image.xyz/source";
const fallbackSrc = "https://image.xyz/placeholder";

describe("Image", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <Image data-testid="image" src={src} />);
    const image = screen.getByTestId("image");

    // assert
    expect(image).toBeInTheDocument();
  });

  it("should render <img> tag", () => {
    // act
    renderWithHopeProvider(() => <Image data-testid="image" src={src} />);
    const image = screen.getByTestId("image");

    // assert
    expect(image).toBeInstanceOf(HTMLImageElement);
  });

  it("renders placeholder first, before image load", async () => {
    // act
    renderWithHopeProvider(() => <Image data-testid="image" src={src} fallbackSrc={fallbackSrc} />);
    const image = screen.getByTestId("image");

    // assert
    expect(image).toHaveAttribute("src", fallbackSrc);
  });

  it("renders image if there is no fallback behavior defined", async () => {
    // act
    renderWithHopeProvider(() => <Image data-testid="image" src={src} />);
    const image = screen.getByTestId("image");

    // assert
    expect(image).toHaveAttribute("src", src);
  });

  it("should have semantic hope class", () => {
    // act
    renderWithHopeProvider(() => <Image data-testid="image" src={src} />);
    const image = screen.getByTestId("image");

    // assert
    expect(image).toHaveClass("hope-image");
  });

  it("should return semantic hope class as css selector when calling toString()", () => {
    expect(Image.toString()).toBe(".hope-image");
  });

  it("should have class from class prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Image data-testid="image" class={stubClass} src={src} />);
    const image = screen.getByTestId("image");

    // assert
    expect(image).toHaveClass(stubClass);
  });

  it("should have class from className prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => (
      // eslint-disable-next-line solid/no-react-specific-props
      <Image data-testid="image" className={stubClass} src={src} />
    ));
    const image = screen.getByTestId("image");

    // assert
    expect(image).toHaveClass(stubClass);
  });

  it("should have class from classList prop", () => {
    // arrange
    const stubClass = "stub";

    // act
    renderWithHopeProvider(() => <Image data-testid="image" classList={{ [stubClass]: true }} src={src} />);
    const image = screen.getByTestId("image");

    // assert
    expect(image).toHaveClass(stubClass);
  });
});
