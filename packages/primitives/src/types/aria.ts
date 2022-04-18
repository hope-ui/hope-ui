import { MaybeAccessor } from "@solid-primitives/utils";

export interface AriaLabelingProps {
  /**
   * Defines a string value that labels the current element.
   */
  "aria-label"?: MaybeAccessor<string | undefined>;

  /**
   * Identifies the element (or elements) that labels the current element.
   */
  "aria-labelledby"?: MaybeAccessor<string | undefined>;

  /**
   * Identifies the element (or elements) that describes the object.
   */
  "aria-describedby"?: MaybeAccessor<string | undefined>;

  /**
   * Identifies the element (or elements) that provide a detailed, extended description for the object.
   */
  "aria-details"?: MaybeAccessor<string | undefined>;
}

export interface AriaValidationProps {
  /**
   * Identifies the element that provides an error message for the object.
   * @see https://www.w3.org/TR/wai-aria-1.2/#aria-errormessage
   */
  "aria-errormessage"?: MaybeAccessor<string | undefined>;
}
