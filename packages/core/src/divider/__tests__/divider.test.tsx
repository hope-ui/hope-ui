import { render, screen } from "solid-testing-library";

import { Divider } from "../divider";

describe("Divider", () => {
  it("should render a '<div>' by default", () => {
    render(() => <Divider />);

    const divider = screen.getByRole("separator");

    expect(divider).toBeInTheDocument();
    expect(divider).toBeInstanceOf(HTMLDivElement);
  });

  it("should render the tag provided by the 'as' prop", () => {
    render(() => <Divider as="span" />);

    const divider = screen.getByRole("separator");

    expect(divider).toBeInTheDocument();
    expect(divider).toBeInstanceOf(HTMLSpanElement);
  });

  it("should not have implicit 'aria-orientation' by default", () => {
    render(() => <Divider />);

    const separator = screen.getByRole("separator");

    expect(separator).not.toHaveAttribute("aria-orientation");
  });

  it("should not have implicit 'aria-orientation' when 'orientation=horizontal'", () => {
    render(() => <Divider orientation="horizontal" />);

    const divider = screen.getByRole("separator");

    expect(divider).not.toHaveAttribute("aria-orientation");
  });

  it("should have 'aria-orientation=vertical' when 'orientation=vertical'", () => {
    render(() => <Divider orientation="vertical" />);

    const divider = screen.getByRole("separator");

    expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  it("should have 'role=separator'", () => {
    render(() => <Divider />);

    const divider = screen.getByRole("separator");

    expect(divider).toHaveAttribute("role", "separator");
  });

  it("should not render children when 'orientation=vertical'", () => {
    render(() => <Divider orientation="vertical">Label</Divider>);

    const divider = screen.getByRole("separator");

    expect(divider).not.toHaveTextContent("Label");
  });

  it("should forwards the ref", () => {
    let ref: HTMLHRElement | undefined;

    render(() => <Divider ref={ref} />);

    const divider = screen.getByRole("separator");

    expect(divider).toBe(ref);
  });

  describe("styles", () => {
    it("should have base class", () => {
      render(() => <Divider />);

      const divider = screen.getByRole("separator");

      expect(divider).toHaveClass("hope-divider");
    });

    it.each(["solid", "dashed"])("should have %p variant modifier class", variant => {
      render(() => <Divider variant={variant as any} />);

      const divider = screen.getByRole("separator");

      expect(divider).toHaveClass(`hope-divider--${variant}`);
    });

    it.each(["horizontal", "vertical"])(
      "should have %p orientation modifier class",
      orientation => {
        render(() => <Divider orientation={orientation as any} />);

        const divider = screen.getByRole("separator");

        expect(divider).toHaveClass(`hope-divider--${orientation}`);
      }
    );

    it.each(["start", "center", "end"])(
      "should have %p labelPlacement modifier class",
      labelPlacement => {
        render(() => <Divider labelPlacement={labelPlacement as any}>Label</Divider>);

        const divider = screen.getByRole("separator");

        expect(divider).toHaveClass(`hope-divider--label-${labelPlacement}`);
      }
    );

    it("should not have labelPlacement modifier class when no children is provided", () => {
      render(() => <Divider labelPlacement="start" />);

      const divider = screen.getByRole("separator");

      expect(divider).not.toHaveClass("hope-divider--label-start");
    });

    it("should not have labelPlacement modifier class when 'orientation=vertical'", () => {
      render(() => <Divider labelPlacement="start" orientation="vertical" />);

      const divider = screen.getByRole("separator");

      expect(divider).not.toHaveClass("hope-divider--label-start");
    });
  });
});
