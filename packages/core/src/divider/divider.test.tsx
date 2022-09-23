import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { Divider } from "./divider";
import { DividerProps } from "./types";

const defaultProps: DividerProps = {
  labelPlacement: "center",
  orientation: "horizontal",
};

describe("Divider", () => {
  itIsPolymorphic(Divider as any, defaultProps);
  itRendersChildren(Divider as any, defaultProps);
  itSupportsClass(Divider as any, defaultProps);
  itHasSemanticClass(Divider as any, defaultProps, "hope-Divider-root");
  itSupportsRef(Divider as any, defaultProps, HTMLDivElement);
  itSupportsStyle(Divider as any, defaultProps);

  it("should have attribute 'role=separator' when its not a <hr> tag.", () => {
    render(() => <Divider data-testid="divider">Label</Divider>);

    const divider = screen.getByTestId("divider");

    expect(divider).toHaveAttribute("role", "separator");
  });
});
