import { createStyleConfig, StyleConfigProps } from "@hope-ui/styles";

import { anchorStyles } from "./anchor.css";

type AnchorParts = "root";

export const useAnchorStyleConfig = createStyleConfig<AnchorParts, {}>({
  root: {
    baseStyle: {
      __staticClass: anchorStyles.root,
    },
  },
});

export type AnchorStyleConfigProps = StyleConfigProps<typeof useAnchorStyleConfig>;
