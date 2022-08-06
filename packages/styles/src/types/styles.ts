import { Accessor } from "solid-js";

import { SystemStyleObject } from "./styled-system";
import { ThemeBase } from "./theme-base";

/** An object of component parts/styles. */
export type StylesObject<ComponentParts extends string> = Record<ComponentParts, SystemStyleObject>;

/** Return a static css className for a given component part. */
export type GetStaticClass<ComponentParts extends string> = (
  part: ComponentParts | string
) => string;

/** An object or function that returns an object of styles. */
export type Styles<
  ComponentParts extends string,
  StylesParams extends Record<string, any> = never
> =
  | StylesObject<ComponentParts>
  | ((
      theme: ThemeBase,
      params: StylesParams,
      getStaticClass: GetStaticClass<ComponentParts>
    ) => StylesObject<ComponentParts>);

/** An object or function that returns a partial object of styles. */
export type PartialStyles<
  ComponentParts extends string,
  StylesParams extends Record<string, any> = never
> =
  | Partial<StylesObject<ComponentParts>>
  | ((
      theme: ThemeBase,
      params: StylesParams,
      getStaticClass: GetStaticClass<ComponentParts>
    ) => Partial<StylesObject<ComponentParts>>);

export type UseStylesOptions<
  ComponentParts extends string,
  StylesParams
> = Partial<StylesParams> & {
  /**
   * Styles that will be merged with the "base styles" created by the `createStyles()` call.
   * Mostly used to override/add additional styles.
   */
  styles?: PartialStyles<ComponentParts, StylesParams>;

  /** Whether the base styles should be applied or not. */
  unstyled?: boolean;
};

export interface UseStylesReturn<ComponentParts extends string> {
  /** Accessor for the styles objects merged with theme and prop styles. */
  styles: Accessor<StylesObject<ComponentParts>>;

  /**
   * Return a static css className for a given component part.
   * @example
   * // getStaticClass("leftIcon") => "hope-Button-leftIcon"
   */
  getStaticClass: GetStaticClass<ComponentParts>;
}
