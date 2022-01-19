import { SystemStyleObject } from "../types";

/**
 * The `css` prop allow you to override styles easily.
 * It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.
 */
export type CSSProp = {
  css?: SystemStyleObject;
};
