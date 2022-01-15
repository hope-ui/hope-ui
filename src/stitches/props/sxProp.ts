import { SystemStyleObject } from "..";

/**
 * The `sx` props allow you to overriding styles easily.
 * It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.
 */
export type SxProp = {
  sx?: SystemStyleObject;
};
