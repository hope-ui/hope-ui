/*!
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/7d7e04d53d871e324debe0a2cb3ff44d7dbf3bca/packages/components/image/src/image.tsx
 */

import { createHopeComponent, hope, Property } from "@hope-ui/styles";
import { OverrideProps } from "@hope-ui/utils";
import { clsx } from "clsx";
import { JSX, mergeProps, Show, splitProps } from "solid-js";

import {
  createImageLoadingStatus,
  CreateImageLoadingStatusProps,
} from "./create-image-loading-status";

interface ImageOptions {
  /** The native HTML `width` attribute to the passed to the `img`. */
  htmlWidth?: string | number;

  /** The native HTML `height` attribute to the passed to the `img`. */
  htmlHeight?: string | number;

  /** Fallback image `src` to show if image is loading or image fails. */
  fallbackSrc?: string;

  /** Fallback element to show if image is loading or image fails. */
  fallback?: JSX.Element;

  /** The image loading strategy. */
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

  /** If `true`, opt out of the `fallbackSrc` logic and use as `img`. */
  ignoreFallback?: boolean;
}

export type ImageProps = OverrideProps<ImageOptions, CreateImageLoadingStatusProps>;

/**
 * Image renders an image with support for fallbacks.
 */
export const Image = createHopeComponent<"img", ImageProps>(props => {
  const [local, loadEventProps, others] = splitProps(
    props,
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

  const shouldIgnore = () => {
    return (
      local.loading != null || // Defer to native `img` tag if `loading` prop is passed.
      local.ignoreFallback ||
      (local.fallbackSrc === undefined && local.fallback === undefined) // if the user doesn't provide any kind of fallback we should ignore it.
    );
  };

  const status = createImageLoadingStatus(
    mergeProps(props, {
      get ignoreFallback() {
        return shouldIgnore();
      },
    } as ImageProps)
  );

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
      when={status() === "loaded"}
      fallback={
        <Show
          when={local.fallback}
          fallback={
            <hope.img src={local.fallbackSrc} class="hope-Image-placeholder" {...sharedProps} />
          }
        >
          {local.fallback}
        </Show>
      }
    >
      <hope.img
        src={local.src}
        srcSet={local.srcSet}
        crossOrigin={local.crossOrigin}
        loading={local.loading}
        class={clsx("hope-Image-root", local.class)}
        {...sharedProps}
      />
    </Show>
  );
});
