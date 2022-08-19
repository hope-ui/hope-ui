import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Stack, StackProps } from "./stack";

const defaultProps: StackProps = {};

describe("Stack", () => {
  itIsPolymorphic(Stack as any, defaultProps);
  itRendersChildren(Stack as any, defaultProps);
  itSupportsClass(Stack as any, defaultProps);
  itHasSemanticClass(Stack as any, defaultProps, "hope-Stack-root");
  itSupportsRef(Stack as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Stack as any, defaultProps);
});
