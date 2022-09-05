/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/7d7e04d53d871e324debe0a2cb3ff44d7dbf3bca/packages/components/image/tests/image.test.tsx
 */

import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { cleanup, render, screen } from "solid-testing-library";

import { Image, ImageProps } from "./image";

const src = "https://image.xyz/source";
const fallbackSrc = "https://image.xyz/placeholder";

const defaultProps: ImageProps = {};

describe("Image", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  itIsPolymorphic(Image as any, defaultProps);
  itRendersChildren(Image as any, defaultProps);
  itSupportsClass(Image as any, defaultProps);
  itHasSemanticClass(Image as any, defaultProps, "hope-Image-root");
  itSupportsRef(Image as any, defaultProps, HTMLImageElement);
  itSupportsStyle(Image as any, defaultProps);

  it("should render placeholder before image load", async () => {
    render(() => <Image data-testid="image" src={src} fallbackSrc={fallbackSrc} />);

    const image = screen.getByTestId("image");

    expect(image).toHaveAttribute("src", fallbackSrc);
  });

  it("should render image if there is no fallback behavior defined", async () => {
    render(() => <Image data-testid="image" src={src} />);

    const image = screen.getByTestId("image");

    expect(image).toHaveAttribute("src", src);
  });
});
