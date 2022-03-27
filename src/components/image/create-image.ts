import { createEffect, createRenderEffect, createSignal, onCleanup } from "solid-js";

import { callHandler } from "@/utils/function";

import { PropsOf } from "../types";

type NativeImageProps = PropsOf<"img">;

export interface CreateImageProps {
  /**
   * The image `src` attribute.
   */
  src?: string;

  /**
   * The image `srcset` attribute.
   */
  srcSet?: string;

  /**
   * The image `sizes` attribute.
   */
  sizes?: string;

  /**
   * A callback for when the image `src` has been loaded.
   */
  onLoad?: NativeImageProps["onLoad"];

  /**
   * A callback for when there was an error loading the image `src`.
   */
  onError?: NativeImageProps["onError"];

  /**
   * If `true`, opt out of the `fallbackSrc` logic and use as `img`.
   */
  ignoreFallback?: boolean;

  /**
   * The key used to set the crossOrigin on the HTMLImageElement into which the image will be loaded.
   * This tells the browser to request cross-origin access when trying to download the image data.
   */
  crossOrigin?: NativeImageProps["crossOrigin"];

  /**
   * The image loading strategy.
   */
  loading?: NativeImageProps["loading"];
}

type Status = "loading" | "failed" | "pending" | "loaded";

type ImageEvent = Event & {
  currentTarget: HTMLImageElement;
  target: Element;
};

/**
 * Custom hook that loads an image in the browser,
 * and let's us know the `status` so we can show image
 * fallback if it is still `pending`.
 *
 * @returns the status of the image loading progress
 *
 * @example
 *
 * ```jsx
 * function App(){
 *   const status = createImage({ src: "image.png" })
 *   return status() === "loaded" ? <img src="image.png" /> : <Placeholder />
 * }
 * ```
 */
export function createImage(props: CreateImageProps) {
  const [statusState, setStatusState] = createSignal<Status>("pending");

  // If user opts out of the fallback/placeholder logic, let's just return 'loaded'.
  const status = () => (props.ignoreFallback ? "loaded" : statusState());

  let imageRef: HTMLImageElement | null = null;

  const flush = () => {
    if (imageRef) {
      imageRef.onload = null;
      imageRef.onerror = null;
      imageRef = null;
    }
  };

  const load = () => {
    if (!props.src) {
      return;
    }

    flush();

    const img = new Image();
    img.src = props.src;

    if (props.crossOrigin) {
      img.crossOrigin = props.crossOrigin;
    }

    if (props.srcSet) {
      img.srcset = props.srcSet;
    }

    if (props.sizes) {
      img.sizes = props.sizes;
    }

    if (props.loading) {
      img.loading = props.loading;
    }

    img.onload = event => {
      flush();
      setStatusState("loaded");
      callHandler(props.onLoad)(event as unknown as ImageEvent);
    };

    img.onerror = error => {
      flush();
      setStatusState("failed");
      callHandler(props.onError)(error as any);
    };

    imageRef = img;
  };

  createEffect(() => {
    setStatusState(props.src ? "loading" : "pending");
  });

  createRenderEffect(() => {
    // If user opts out of the fallback/placeholder logic, let's bail out.
    if (props.ignoreFallback) {
      return undefined;
    }

    if (statusState() === "loading") {
      load();
    }

    onCleanup(() => {
      flush();
    });
  });

  return status;
}
