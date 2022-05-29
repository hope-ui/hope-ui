import { fireEvent, screen } from "solid-testing-library";

import { Button } from "../../src";
import { renderWithHopeProvider, triggerPress } from "../test-utils";

describe("Button", () => {
  const onPressSpy = jest.fn();

  afterEach(() => {
    onPressSpy.mockClear();
  });

  it(" handles defaults", async () => {
    renderWithHopeProvider(() => <Button onPress={onPressSpy}>Click Me</Button>);

    const button = screen.getByRole("button");

    await triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    const text = screen.getByText("Click Me");
    expect(text).not.toBeNull();
  });

  it("allows custom props to be passed through to the button", () => {
    renderWithHopeProvider(() => <Button data-foo="bar">Click Me</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-foo", "bar");
  });

  it("supports aria-label", () => {
    renderWithHopeProvider(() => <Button aria-label="Test" />);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Test");
  });

  it("supports aria-labelledby", () => {
    renderWithHopeProvider(() => (
      <>
        <span id="test">Test</span>
        <Button aria-labelledby="test" />
      </>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-labelledby", "test");
  });

  it("supports aria-describedby", () => {
    renderWithHopeProvider(() => (
      <>
        <span id="test">Test</span>
        <Button aria-describedby="test">Hi</Button>
      </>
    ));

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-describedby", "test");
  });

  it("allows a custom class on the button", () => {
    renderWithHopeProvider(() => <Button class="test">Click Me</Button>);

    const button = screen.getByRole("button");
    expect(button.getAttribute("class")).toEqual(expect.stringContaining("test"));
  });

  it("handles deprecated onClick", async () => {
    const spyWarn = jest.spyOn(console, "warn").mockImplementation();

    renderWithHopeProvider(() => <Button onClick={onPressSpy}>Click Me</Button>);

    const button = screen.getByRole("button");

    await triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    expect(spyWarn).toHaveBeenCalledWith("onClick is deprecated, please use onPress");
  });
});
