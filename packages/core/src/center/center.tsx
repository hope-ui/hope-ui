import { hope } from "@hope-ui/styles";

/**
 * `Center` is used to horizontally and vertically center its child.
 * It uses the popular `display: flex` centering technique.
 */
export const Center = hope("div", {
  baseStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
