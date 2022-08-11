import { ClassProp } from "@hope-ui/utils";

import { RecipeOptionsOf, UseRecipeFn } from "./recipe";
import { SxProp, SystemStyleObject, SystemStyleProps } from "./styled-system";

/** Hope UI specific props. */
export interface HopeProps extends SystemStyleProps, SxProp, ClassProp {
  /**
   * The `__css` prop has the same API as the `sx` prop, but with a lower style priority.
   * Use it to apply base styles that can be overridden by `sx` and `system style` props.
   */
  __css?: SystemStyleObject;
}

/** Props of components that supports the `Recipe API` and `system style` props. */
export type RecipeProps<RecipeFn extends UseRecipeFn<any, any, any>> = HopeProps &
  Partial<RecipeOptionsOf<RecipeFn>["variants"] & RecipeOptionsOf<RecipeFn>["params"]> & {
    /**
     * Styles that will be merged with the "base styles" created by the `createRecipe` call.
     * Mostly used to override/add additional styles.
     */
    styles?: RecipeOptionsOf<RecipeFn>["styles"];

    /** Whether the base styles should be applied or not. */
    unstyled?: RecipeOptionsOf<RecipeFn>["unstyled"];
  };
