import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Container, ContainerProps } from "./container";

const defaultProps: ContainerProps = {
  isCentered: true,
  centerContent: false,
};

describe("Container", () => {
  itIsPolymorphic(Container as any, defaultProps);
  itRendersChildren(Container as any, defaultProps);
  itSupportsClass(Container as any, defaultProps);
  itHasSemanticClass(Container as any, defaultProps, "hope-Container-root");
  itSupportsRef(Container as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Container as any, defaultProps);
});
