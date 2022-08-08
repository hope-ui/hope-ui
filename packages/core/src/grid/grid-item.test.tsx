import {
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { GridItem, GridItemProps } from "./grid-item";

const defaultProps: GridItemProps = {};

describe("GridItem", () => {
  itIsPolymorphic(GridItem as any, defaultProps);
  itRendersChildren(GridItem as any, defaultProps);
  itSupportsClass(GridItem as any, defaultProps);
  itSupportsRef(GridItem as any, defaultProps, HTMLDivElement);
  itSupportsStyle(GridItem as any, defaultProps);
});
