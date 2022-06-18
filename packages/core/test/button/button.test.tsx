import userEvent from "@testing-library/user-event";
import { fireEvent, screen } from "solid-testing-library";

import { Button } from "../../src";
import { renderWithHopeProvider, triggerPress } from "../test-utils";

describe("Button", () => {
  const onPressSpy = jest.fn();

  afterEach(() => {
    onPressSpy.mockClear();
  });

  it("should render <button> tag by default", () => {
    renderWithHopeProvider(() => <Button>Button</Button>);

    const button = screen.getByRole("button");

    expect(button).toBeInstanceOf(HTMLButtonElement);
  });

  it("should render tag provided with the as prop", () => {
    renderWithHopeProvider(() => <Button as="span">Button</Button>);

    const button = screen.getByRole("button");

    expect(button).toBeInstanceOf(HTMLSpanElement);
  });

  it("should handles defaults", async () => {
    renderWithHopeProvider(() => (
      <Button onPress={onPressSpy}>Click Me</Button>
    ));

    const button = screen.getByRole("button");

    await triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    const text = screen.getByText("Click Me");
    expect(text).not.toBeNull();
  });

  it("should allows custom props to be passed through", () => {
    renderWithHopeProvider(() => <Button data-foo="bar">Click Me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-foo", "bar");
  });

  it("should supports aria-label", () => {
    renderWithHopeProvider(() => <Button aria-label="Test" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Test");
  });

  it("should supports aria-labelledby", () => {
    renderWithHopeProvider(() => (
      <>
        <span id="test">Test</span>
        <Button aria-labelledby="test" />
      </>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-labelledby", "test");
  });

  it("should supports aria-describedby", () => {
    renderWithHopeProvider(() => (
      <>
        <span id="test">Test</span>
        <Button aria-describedby="test">Hi</Button>
      </>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-describedby", "test");
  });

  it("should have base button class", () => {
    renderWithHopeProvider(() => <Button>Button</Button>);

    const button = screen.getByRole("button");

    expect(button).toHaveClass("hope-button");
  });

  it("should have variants related classes", () => {
    renderWithHopeProvider(() => (
      <Button variant="subtle" colorScheme="success" size="md">
        Button
      </Button>
    ));

    const button = screen.getByRole("button");

    expect(button).toHaveClass("hope-button--subtle");
    expect(button).toHaveClass("hope-button--success");
    expect(button).toHaveClass("hope-button--md");
  });

  it("should have loading button class when is loading", () => {
    renderWithHopeProvider(() => <Button isLoading>Button</Button>);

    const button = screen.getByRole("button");

    expect(button).toHaveClass("hope-button--is-loading");
  });

  it("should have full width button class when is full width", () => {
    renderWithHopeProvider(() => <Button isFullWidth>Button</Button>);

    const button = screen.getByRole("button");

    expect(button).toHaveClass("hope-button--is-full-width");
  });

  it("should have hover button class when hovered", async () => {
    renderWithHopeProvider(() => <Button>Button</Button>);

    const button = screen.getByRole("button");

    fireEvent.mouseEnter(button);
    await Promise.resolve();

    expect(button).toHaveClass("hope-button--is-hovered");
  });

  it("should have active button class when pressed", async () => {
    renderWithHopeProvider(() => <Button>Button</Button>);

    const button = screen.getByRole("button");

    fireEvent.mouseDown(button);
    await Promise.resolve();

    expect(button).toHaveClass("hope-button--is-active");
  });

  it("should have disabled button class when disabled", () => {
    renderWithHopeProvider(() => <Button isDisabled>Button</Button>);

    const button = screen.getByRole("button");

    expect(button).toHaveClass("hope-button--is-disabled");
  });

  it("should allows custom classes", () => {
    renderWithHopeProvider(() => <Button class="test">Click Me</Button>);

    const button = screen.getByRole("button");

    expect(button.getAttribute("class")).toEqual(
      expect.stringContaining("test")
    );
  });

  it("should have focus ring class when keyboard focused", async () => {
    renderWithHopeProvider(() => <Button>Button</Button>);

    const button = screen.getByRole("button");

    await userEvent.tab();
    expect(document.activeElement).toBe(button);
    expect(button).toHaveClass("hope-focus-ring");
  });

  it("should handles deprecated onClick", async () => {
    const spyWarn = jest.spyOn(console, "warn").mockImplementation();

    renderWithHopeProvider(() => (
      <Button onClick={onPressSpy}>Click Me</Button>
    ));

    const button = screen.getByRole("button");

    await triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    expect(spyWarn).toHaveBeenCalledWith(
      "onClick is deprecated, please use onPress"
    );
  });

  it("can render an <a> tag", async () => {
    renderWithHopeProvider(() => (
      <Button as="a" onPress={onPressSpy}>
        Click Me
      </Button>
    ));

    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("tabindex", "0");
    expect(button).not.toHaveAttribute("type", "button");

    await triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: "Enter", code: 13 });
    await Promise.resolve();

    fireEvent.keyUp(button, { key: "Enter", code: 13 });
    await Promise.resolve();

    expect(onPressSpy).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(button, { key: " ", code: 32 });
    await Promise.resolve();

    fireEvent.keyUp(button, { key: " ", code: 32 });
    await Promise.resolve();

    expect(onPressSpy).toHaveBeenCalledTimes(3);
  });

  it("can render and <a> tag with href", async () => {
    renderWithHopeProvider(() => (
      <Button as="a" onPress={onPressSpy} href="#only-hash-in-jsdom">
        Click Me
      </Button>
    ));

    const button = screen.getByRole("button");

    expect(button).toHaveAttribute("tabindex", "0");
    expect(button).toHaveAttribute("href", "#only-hash-in-jsdom");

    await triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it("should not respond when disabled", async () => {
    renderWithHopeProvider(() => (
      <Button onPress={onPressSpy} isDisabled>
        Click Me
      </Button>
    ));

    const button = screen.getByRole("button");

    await triggerPress(button);
    expect(button).toBeDisabled();
    expect(onPressSpy).not.toHaveBeenCalled();
  });

  it("should supports autoFocus", () => {
    // eslint-disable-next-line jsx-a11y/no-autofocus
    renderWithHopeProvider(() => <Button autoFocus>Click Me</Button>);

    const button = screen.getByRole("button");
    expect(document.activeElement).toBe(button);
  });
});
