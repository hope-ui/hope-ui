import { CSS } from "@stitches/core";
import type * as Util from "@stitches/core/types/util";

import { ElementType } from "..";
import { stitches } from "../stitches.config";

/**
 * Design tokens interface based on the stitches configuration.
 */
export type SystemTokens = typeof stitches.theme;

/**
 * Media at-rules interface based on the stitches configuration.
 */
export type SystemMedia = typeof stitches.config.media;

/**
 * Style interface based on the stitches configuration.
 */
export type SystemStyleObject = CSS<typeof stitches.config>;

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
 * Stitches `css` method composer param.
 */
export type CSSComposer<
  Composers extends (string | ElementType | Util.Function | { [name: string]: unknown })[]
> = {
  [K in keyof Composers]: Composers[K] extends string | ElementType | Util.Function // Strings, SolidJS components and Functions can be skipped over
    ? Composers[K]
    : RemoveIndex<SystemStyleObject> & {
        /** The **variants** property lets you set a subclass of styles based on a key-value pair.
         *
         * [Read Documentation](https://stitches.dev/docs/variants)
         */
        variants?: {
          [Name in string]: {
            [Pair in number | string]: SystemStyleObject;
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
          css: SystemStyleObject;
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
      } & SystemStyleObject & {
          [K2 in keyof Composers[K]]: K2 extends "compoundVariants" | "defaultVariants" | "variants"
            ? unknown
            : K2 extends keyof SystemStyleObject
            ? SystemStyleObject[K2]
            : unknown;
        };
};
