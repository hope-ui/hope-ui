import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";

import { Kbd, KbdProps } from "./kbd";

const defaultProps: KbdProps = {};

describe("Kbd", () => {
  itIsPolymorphic(Kbd as any, defaultProps);
  itRendersChildren(Kbd as any, defaultProps);
  itSupportsClass(Kbd as any, defaultProps);
  itHasSemanticClass(Kbd as any, defaultProps, "hope-Kbd-root");
  itSupportsRef(Kbd as any, defaultProps, HTMLElement);
  itSupportsStyle(Kbd as any, defaultProps);
});
