import {
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Box } from "../../src";

const defaultProps = {};

describe("Box", () => {
  itIsPolymorphic(Box as any, defaultProps);
  itRendersChildren(Box as any, defaultProps);
  itSupportsClass(Box as any, defaultProps);
  itSupportsRef(Box as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Box as any, defaultProps);
});
