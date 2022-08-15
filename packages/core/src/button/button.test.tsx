import {
  itHasSemanticClass,
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import { render, screen } from "solid-testing-library";

import { Button } from "./button";
import { ButtonProps } from "./types";

const defaultProps: ButtonProps = {};

describe("Button", () => {
  itIsPolymorphic(Button as any, defaultProps);
  itRendersChildren(Button as any, defaultProps);
  itSupportsClass(Button as any, defaultProps);
  itHasSemanticClass(Button as any, defaultProps, "hope-button");
  itSupportsRef(Button as any, defaultProps, HTMLButtonElement);
  itSupportsStyle(Button as any, defaultProps);

  it("should have attribute 'role=button' when its not a native button nor an <a> tag", () => {
    render(() => (
      <Button as="div" data-testid="button">
        Button
      </Button>
    ));

    const button = screen.getByTestId("button");

    expect(button).toHaveAttribute("role", "button");
  });

  it("should not have attribute 'role=button' when its a native button", () => {
    render(() => <Button data-testid="button">Button</Button>);

    const button = screen.getByTestId("button");

    expect(button).not.toHaveAttribute("role");
  });

  it("should not have attribute 'role=button' when its an <a> tag", () => {
    render(() => (
      <Button as="a" data-testid="button">
        Button
      </Button>
    ));

    const button = screen.getByTestId("button");

    expect(button).not.toHaveAttribute("role");
  });

  it("should have 'type' from props", () => {
    render(() => (
      <Button type="submit" data-testid="button">
        Button
      </Button>
    ));

    const button = screen.getByTestId("button") as HTMLButtonElement;

    expect(button.type).toBe("submit");
  });

  it("should have 'type=button' by default when its a native button", () => {
    render(() => <Button data-testid="button">Button</Button>);

    const button = screen.getByTestId("button") as HTMLButtonElement;

    expect(button.type).toBe("button");
  });

  it("should not have 'type' by default when its not a native button", () => {
    render(() => (
      <Button as="div" data-testid="button">
        Button
      </Button>
    ));

    const button = screen.getByTestId("button");

    // @ts-ignore
    expect(button.type).toBeUndefined();
  });

  it("should have attribute 'tabindex=0' when its not a native button", () => {
    render(() => (
      <Button as="div" data-testid="button">
        Button
      </Button>
    ));

    const button = screen.getByTestId("button");

    expect(button).toHaveAttribute("tabindex", "0");
  });

  it("should not have attribute 'tabindex' when its a native button", () => {
    render(() => <Button data-testid="button">Button</Button>);

    const button = screen.getByTestId("button");

    expect(button).not.toHaveAttribute("tabindex");
  });
});
