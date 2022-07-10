import { render, screen } from "solid-testing-library";

import { Divider } from "../src";

describe("BaseDivider", () => {
  it("should render an '<hr>' tag by default", () => {
    render(() => <Divider />);

    const divider = screen.getByRole("separator");

    expect(divider).toBeInTheDocument();
    expect(divider).toBeInstanceOf(HTMLHRElement);
  });

  it("should render the tag provided by the 'as' prop", () => {
    render(() => <Divider as="div" />);

    const divider = screen.getByRole("separator");

    expect(divider).toBeInTheDocument();
    expect(divider).toBeInstanceOf(HTMLDivElement);
  });

  it("should not have implicit 'aria-orientation' attribute by default", () => {
    render(() => <Divider />);

    const separator = screen.getByRole("separator");

    expect(separator).not.toHaveAttribute("aria-orientation");
  });

  it("should not have implicit 'aria-orientation' attribute when 'orientation' prop is 'horizontal'", () => {
    render(() => <Divider orientation="horizontal" />);

    const divider = screen.getByRole("separator");

    expect(divider).not.toHaveAttribute("aria-orientation");
  });

  it("should have 'aria-orientation=vertical' attribute when 'orientation' prop is 'vertical'", () => {
    render(() => <Divider orientation="vertical" />);

    const divider = screen.getByRole("separator");

    expect(divider).toHaveAttribute("aria-orientation", "vertical");
  });

  it("should not have implicit 'role' attribute when rendered element is an '<hr>'", () => {
    render(() => <Divider />);

    const divider = screen.getByRole("separator");

    expect(divider).not.toHaveAttribute("role");
  });

  it("should have 'role=separator' attribute when rendered element is not an '<hr>'", () => {
    render(() => <Divider as="div" />);

    const divider = screen.getByRole("separator");

    expect(divider).toHaveAttribute("role", "separator");
  });

  it("should forwards the ref", () => {
    let ref: HTMLHRElement | undefined;

    render(() => <Divider ref={ref} />);

    const divider = screen.getByRole("separator");

    expect(divider).toBe(ref);
  });
});
