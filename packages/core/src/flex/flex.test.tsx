import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Flex, FlexProps } from "./flex";

const defaultProps: FlexProps = {};

describe("Container", () => {
  itIsPolymorphic(Flex as any, defaultProps);
  itRendersChildren(Flex as any, defaultProps);
  itSupportsClass(Flex as any, defaultProps);
  itHasSemanticClass(Flex as any, defaultProps, "hope-flex");
  itSupportsRef(Flex as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Flex as any, defaultProps);
});
