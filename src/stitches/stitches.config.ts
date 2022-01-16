import { createStitches, CSS, defaultThemeMap } from "@stitches/core";
import type * as Util from "@stitches/core/types/util";

import { media } from "./media";
import { defaultThemeTokens } from "./tokens";
import { utils } from "./utils";

export const { css, globalCss, keyframes, getCssText, theme, createTheme, config } = createStitches(
  {
    prefix: "hope",
    themeMap: defaultThemeMap,
    theme: defaultThemeTokens,
    media,
    utils,
  }
);

export type StitchesTheme = typeof theme;

export type SystemMedia = typeof config.media;

/**
 * Style interface based on the stitches theme configuration.
 */
export type SystemStyleObject = CSS<typeof config>;

/**
 * Takes in an existing TKey and adds a the Stitches token prefix `$` to it, if TKey extends the type string or number.
 * If not, never is returned instead as a type.
 * */
export type AddStitchesTokenPrefix<TKey> = TKey extends string | number ? `$${TKey}` : never;

/**
 * Remove an index signature from a type
 * */
export type RemoveIndex<T> = {
  [k in keyof T as string extends k ? never : number extends k ? never : k]: T[k];
};

/**
 * Parameter of the stitches `css` method.
 */
export type CSSComposer<
  Composers extends (string | Util.Function | { [name: string]: unknown })[],
  CSS = SystemStyleObject
> = {
  [K in keyof Composers]: Composers[K] extends string | Util.Function // Strings and Functions can be skipped over
    ? Composers[K]
    : RemoveIndex<CSS> & {
        /** The **variants** property lets you set a subclass of styles based on a key-value pair.
         *
         * [Read Documentation](https://stitches.dev/docs/variants)
         */
        variants?: {
          [Name in string]: {
            [Pair in number | string]: CSS;
          };
        };
        /** The **compoundVariants** property lets you to set a subclass of styles based on a combination of active variants.
         *
         * [Read Documentation](https://stitches.dev/docs/variants#compound-variants)
         */
        compoundVariants?: (("variants" extends keyof Composers[K]
          ? {
              [Name in keyof Composers[K]["variants"]]?:
                | Util.Widen<keyof Composers[K]["variants"][Name]>
                | Util.String;
            }
          : Util.WideObject) & {
          css: CSS;
        })[];
        /** The **defaultVariants** property allows you to predefine the active key-value pairs of variants.
         *
         * [Read Documentation](https://stitches.dev/docs/variants#default-variants)
         */
        defaultVariants?: "variants" extends keyof Composers[K]
          ? {
              [Name in keyof Composers[K]["variants"]]?:
                | Util.Widen<keyof Composers[K]["variants"][Name]>
                | Util.String;
            }
          : Util.WideObject;
      } & CSS & {
          [K2 in keyof Composers[K]]: K2 extends "compoundVariants" | "defaultVariants" | "variants"
            ? unknown
            : K2 extends keyof CSS
            ? CSS[K2]
            : unknown;
        };
};
