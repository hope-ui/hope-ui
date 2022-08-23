import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Text, TextProps } from "./text";

const defaultProps: TextProps = {};

describe("Text", () => {
  itIsPolymorphic(Text as any, defaultProps);
  itRendersChildren(Text as any, defaultProps);
  itSupportsClass(Text as any, defaultProps);
  itHasSemanticClass(Text as any, defaultProps, "hope-Text-root");
  itSupportsRef(Text as any, defaultProps, HTMLParagraphElement);
  itSupportsStyle(Text as any, defaultProps);
});
