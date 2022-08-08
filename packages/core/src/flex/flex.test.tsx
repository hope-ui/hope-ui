import {
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Flex, FlexProps } from "./flex";

const defaultProps: FlexProps = {};

describe("Flex", () => {
  itIsPolymorphic(Flex as any, defaultProps);
  itRendersChildren(Flex as any, defaultProps);
  itSupportsClass(Flex as any, defaultProps);
  itSupportsRef(Flex as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Flex as any, defaultProps);
});