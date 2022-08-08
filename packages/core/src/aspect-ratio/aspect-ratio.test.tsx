import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { AspectRatio, AspectRatioProps } from "./aspect-ratio";

const defaultProps: AspectRatioProps = {
  ratio: 4 / 3,
};

describe("AspectRatio", () => {
  itIsPolymorphic(AspectRatio as any, defaultProps);
  itRendersChildren(AspectRatio as any, defaultProps);
  itSupportsClass(AspectRatio as any, defaultProps);
  itHasSemanticClass(AspectRatio as any, defaultProps, "hope-aspect-ratio");
  itSupportsRef(AspectRatio as any, defaultProps, HTMLDivElement);
  itSupportsStyle(AspectRatio as any, defaultProps);
});
