import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Divider, DividerProps } from "./divider";

const defaultProps: DividerProps = {
  textPosition: "center",
  dashed: false,
  plain: false,
  orientation: "horizontal",
};

describe("Divider", () => {
  itIsPolymorphic(Divider as any, defaultProps);
  itRendersChildren(Divider as any, defaultProps);
  itSupportsClass(Divider as any, defaultProps);
  itHasSemanticClass(Divider as any, defaultProps, "hope-Divider-root");
  itSupportsRef(Divider as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Divider as any, defaultProps);
});
