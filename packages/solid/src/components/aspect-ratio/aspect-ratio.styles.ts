import { css } from "../../styled-system/stitches.config";

export const aspectRatioStyles = css({
  position: "relative",

  "&::before": {
    height: 0,
    content: "''",
    display: "block",
  },

  "& > *:not(style)": {
    overflow: "hidden",
    position: "absolute",
    top: "0",
    right: "0",
    bottom: "0",
    left: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },

  "& > img, & > video": {
    objectFit: "cover",
  },
});
