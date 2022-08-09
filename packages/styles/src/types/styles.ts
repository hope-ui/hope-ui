import { Accessor } from "solid-js";

import { SystemStyleObject } from "./styled-system";
import { ThemeBase } from "./theme-base";

/** An object of component parts/style. */
export type StylesObject<ComponentParts extends string> = Record<ComponentParts, SystemStyleObject>;

/** Return a static css class. */
export type GetStaticClass = (suffix: string) => string;

/** An object or function that returns a styles object. */
export type StylesInterpolation<
  ComponentParts extends string,
  StylesParams extends Record<string, any>
> =
  | StylesObject<ComponentParts>
  | ((
      theme: ThemeBase,
      params: StylesParams,
      getStaticClass: GetStaticClass
    ) => StylesObject<ComponentParts>);

/** An object or function that returns a partial styles object. */
export type PartialStylesInterpolation<
  ComponentParts extends string,
  StylesParams extends Record<string, any>
> =
  | Partial<StylesObject<ComponentParts>>
  | ((
      theme: ThemeBase,
      params: StylesParams,
      getStaticClass: GetStaticClass
    ) => Partial<StylesObject<ComponentParts>>);

export type UseStylesOptions<
  ComponentParts extends string,
  StylesParams extends Record<string, any>
> = Partial<StylesParams> & {
  /**
   * Styles that will be merged with the "base styles" created by the `createStyles` call.
   * Mostly used to override/add additional styles.
   */
  styles?: PartialStylesInterpolation<ComponentParts, StylesParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
};

export interface UseStylesReturn<ComponentParts extends string> {
  /** An accessor for the styles object merged with theme and prop styles. */
  styles: Accessor<StylesObject<ComponentParts>>;

  /**
   * Return a static css class.
   * @example
   * // getStaticClass("leftIcon") => "hope-cl-0-leftIcon"
   */
  getStaticClass: GetStaticClass;
}
