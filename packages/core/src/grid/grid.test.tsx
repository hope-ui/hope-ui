import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Grid, GridProps } from "./grid";

const defaultProps: GridProps = {};

describe("Grid", () => {
  itIsPolymorphic(Grid as any, defaultProps);
  itRendersChildren(Grid as any, defaultProps);
  itSupportsClass(Grid as any, defaultProps);
  itHasSemanticClass(Grid as any, defaultProps, "hope-grid");
  itSupportsRef(Grid as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Grid as any, defaultProps);
});
