import { hope } from "../factory";

/**
 * Center is a layout component that centers its child within itself.
 */
export const Center = hope("div", {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});
