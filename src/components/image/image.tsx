import { Property } from "csstype";
import { createMemo, JSX, Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";
import { RightJoinProps } from "@/utils/types";

import { Box } from "../box";
import { ElementType, HTMLHopeProps } from "../types";
import { createImage, CreateImageProps } from "./create-image";

interface ImageOptions {
  /**
   * The native HTML `width` attribute to the passed to the `img`
   */
  htmlWidth?: string | number;

  /**
   * The native HTML `height` attribute to the passed to the `img`
   */
  htmlHeight?: string | number;

  /**
   * Fallback image `src` to show if image is loading or image fails.
   *
   * Note 🚨: We recommend you use a local image.
   */
  fallbackSrc?: string;

  /**
   * Fallback element to show if image is loading or image fails.
   */
  fallback?: JSX.Element;

  /**
   * Defines loading strategy.
   */
  loading?: "eager" | "lazy";

  /**
   * How the image to fit within its bounds.
   * It maps to css `object-fit` property.
   */
  fit?: Property.ObjectFit;

  /**
   * How to align the image within its bounds.
   * It maps to css `object-position` property.
   */
  align?: Property.ObjectPosition;

  /**
   * If `true`, opt out of the `fallbackSrc` logic and use as `img`.
   */
  ignoreFallback?: boolean;
}

export type ImageProps<C extends ElementType = "img"> = RightJoinProps<
  HTMLHopeProps<C, ImageOptions>,
  CreateImageProps
>;

const hopeImageClass = "hope-image";

/**
 * Image renders an image with support for fallbacks
 */
export function Image<C extends ElementType = "img">(props: ImageProps<C>) {
  const [local, loadEventProps, others] = splitProps(
    props as ImageProps<"img">,
    [
      "class",
      "htmlWidth",
      "htmlHeight",
      "fallbackSrc",
      "fallback",
      "src",
      "srcSet",
      "align",
      "fit",
      "loading",
      "ignoreFallback",
      "crossOrigin",
    ],
    ["onError", "onLoad"]
  );

  const classes = () => classNames(local.class, hopeImageClass);

  const shouldIgnore = () => {
    return (
      local.loading != null || // Defer to native `img` tag if `loading` prop is passed.
      local.ignoreFallback ||
      (local.fallbackSrc === undefined && local.fallback === undefined) // if the user doesn't provide any kind of fallback we should ignore it.
    );
  };

  const status = createMemo(() => createImage({ ...props, ignoreFallback: shouldIgnore() }));

  const sharedProps = () => ({
    objectFit: local.fit,
    objectPosition: local.align,
    width: local.htmlWidth,
    height: local.htmlHeight,
    ...(shouldIgnore() ? loadEventProps : {}),
    ...others,
  });

  return (
    <Show
      when={status()() === "loaded"}
      fallback={
        <Show
          when={local.fallback}
          fallback={<Box as="img" src={local.fallbackSrc} class="hope-image__placeholder" {...sharedProps} />}
        >
          {local.fallback}
        </Show>
      }
    >
      <Box
        as="img"
        src={local.src}
        srcSet={local.srcSet}
        crossOrigin={local.crossOrigin}
        loading={local.loading}
        class={classes()}
        {...sharedProps}
      />
    </Show>
  );
}

Image.toString = () => createClassSelector(hopeImageClass);
