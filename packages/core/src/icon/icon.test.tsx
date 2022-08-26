import {
  itHasSemanticClass,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { Icon, IconProps } from "./icon";

const path = () => (
  <path fill="currentColor" d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0" />
);

const defaultProps: IconProps = {
  children: path,
};

describe("Icon", () => {
  itRendersChildren(Icon as any, defaultProps);
  itSupportsClass(Icon as any, defaultProps);
  itHasSemanticClass(Icon as any, defaultProps, "hope-Icon-root");
  itSupportsRef(Icon as any, defaultProps, SVGSVGElement);
  itSupportsStyle(Icon as any, defaultProps);

  it("should have default viewBox", () => {
    render(() => <Icon data-testid="icon">{path}</Icon>);

    const icon = screen.getByTestId("icon");

    expect(icon).toHaveAttribute("viewBox", "0 0 24 24");
  });

  it("supports custom viewBox", () => {
    render(() => (
      <Icon data-testid="icon" viewBox="0 0 20 20">
        {path}
      </Icon>
    ));

    const icon = screen.getByTestId("icon");

    expect(icon).toHaveAttribute("viewBox", "0 0 20 20");
  });
});
