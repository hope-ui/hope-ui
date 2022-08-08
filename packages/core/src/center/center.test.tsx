import {
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Center } from "./center";

const defaultProps = {};

describe("Center", () => {
  itIsPolymorphic(Center as any, defaultProps);
  itRendersChildren(Center as any, defaultProps);
  itSupportsClass(Center as any, defaultProps);
  itSupportsRef(Center as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Center as any, defaultProps);
});
