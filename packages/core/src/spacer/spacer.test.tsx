import {
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Spacer } from "./spacer";

const defaultProps = {};

describe("Spacer", () => {
  itIsPolymorphic(Spacer as any, defaultProps);
  itRendersChildren(Spacer as any, defaultProps);
  itSupportsClass(Spacer as any, defaultProps);
  itSupportsRef(Spacer as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Spacer as any, defaultProps);
});
