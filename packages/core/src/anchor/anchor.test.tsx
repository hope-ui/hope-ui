import {
  checkAccessibility,
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { Anchor, AnchorProps } from "./anchor";

const defaultProps: AnchorProps = {};

describe("Anchor", () => {
  checkAccessibility([<Anchor href="/">Anchor</Anchor>]);
  itIsPolymorphic(Anchor as any, defaultProps);
  itRendersChildren(Anchor as any, defaultProps);
  itSupportsClass(Anchor as any, defaultProps);
  itHasSemanticClass(Anchor as any, defaultProps, "hope-Anchor-root");
  itSupportsRef(Anchor as any, defaultProps, HTMLAnchorElement);
  itSupportsStyle(Anchor as any, defaultProps);

  it("should have attribute 'target=_blank' when 'isExternal' is true", () => {
    render(() => (
      <Anchor href="/" isExternal>
        Anchor
      </Anchor>
    ));

    const anchor = screen.getByRole("link") as HTMLAnchorElement;

    expect(anchor.target).toBe("_blank");
  });

  it("should not have attribute 'target=_blank' when 'isExternal' is false", () => {
    render(() => <Anchor href="/">Anchor</Anchor>);

    const anchor = screen.getByRole("link") as HTMLAnchorElement;

    expect(anchor).not.toHaveAttribute("target");
  });

  it("should have attribute 'rel=noopener noreferrer' when 'isExternal' is true", () => {
    render(() => (
      <Anchor href="/" isExternal>
        Anchor
      </Anchor>
    ));

    const anchor = screen.getByRole("link") as HTMLAnchorElement;

    expect(anchor.rel).toBe("noopener noreferrer");
  });

  it("should not have attribute 'rel=noopener noreferrer' when 'isExternal' is false", () => {
    render(() => <Anchor href="/">Anchor</Anchor>);

    const anchor = screen.getByRole("link") as HTMLAnchorElement;

    expect(anchor).not.toHaveAttribute("rel");
  });
});
