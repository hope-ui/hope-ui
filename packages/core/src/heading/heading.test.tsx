import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Heading, HeadingProps } from "./heading";

const defaultProps: HeadingProps = {};

describe("Heading", () => {
  itIsPolymorphic(Heading as any, defaultProps);
  itRendersChildren(Heading as any, defaultProps);
  itSupportsClass(Heading as any, defaultProps);
  itHasSemanticClass(Heading as any, defaultProps, "hope-Heading-root");
  itSupportsRef(Heading as any, defaultProps, HTMLHeadingElement);
  itSupportsStyle(Heading as any, defaultProps);
});
