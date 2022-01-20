import { hope } from "..";

/**
 * A flexible flex spacer that expands along the major axis of its containing flex layout.
 * It renders a `div` by default, and takes up any available space.
 */
export const Spacer = hope("div", {
  flex: 1,
  justifySelf: "stretch",
  alignSelf: "stretch",
});
