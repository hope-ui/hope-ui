import { screen, within } from "solid-testing-library";

import { Button, ButtonGroup, ButtonGroupComponentProps } from "../../src";
import { renderWithHopeProvider, triggerPress } from "../test-utils";

const onPressSpy1 = jest.fn();
const onPressSpy2 = jest.fn();
const onPressSpy3 = jest.fn();

function Example(props: ButtonGroupComponentProps) {
  return (
    <ButtonGroup {...props}>
      <Button onPress={onPressSpy1}>Button1</Button>
      <Button onPress={onPressSpy2}>Button2</Button>
      <Button onPress={onPressSpy3}>Button3</Button>
    </ButtonGroup>
  );
}

describe("ButtonGroup", () => {
  afterEach(() => {
    onPressSpy1.mockClear();
    onPressSpy2.mockClear();
    onPressSpy3.mockClear();
  });

  it("should have role=group", async () => {
    renderWithHopeProvider(() => <ButtonGroup />);

    const buttonGroup = screen.getByRole("group");

    expect(buttonGroup).toBeTruthy();
  });

  it("should renders a  <div> by default", async () => {
    renderWithHopeProvider(() => <ButtonGroup />);

    const buttonGroup = screen.getByRole("group");

    expect(buttonGroup).toBeInstanceOf(HTMLDivElement);
  });

  it("should renders multiple buttons", async () => {
    renderWithHopeProvider(() => <Example />);

    const buttonGroup = screen.getByRole("group");
    expect(buttonGroup).toBeTruthy();

    const button1 = within(buttonGroup).getByText("Button1");
    const button2 = within(buttonGroup).getByText("Button2");
    const button3 = within(buttonGroup).getByText("Button3");

    expect(button1).toBeTruthy();
    expect(button2).toBeTruthy();
    expect(button3).toBeTruthy();

    await triggerPress(button1);
    await triggerPress(button2);
    await triggerPress(button3);

    expect(onPressSpy1).toHaveBeenCalledTimes(1);
    expect(onPressSpy2).toHaveBeenCalledTimes(1);
    expect(onPressSpy3).toHaveBeenCalledTimes(1);
  });

  it("should disable all buttons within when isDisabled is true", async () => {
    renderWithHopeProvider(() => <Example isDisabled />);

    const buttonGroup = screen.getByRole("group");
    expect(buttonGroup).toBeTruthy();

    const button1 = within(buttonGroup).getByText("Button1");
    const button2 = within(buttonGroup).getByText("Button2");
    const button3 = within(buttonGroup).getByText("Button3");

    await triggerPress(button1);
    await triggerPress(button2);
    await triggerPress(button3);

    expect(onPressSpy1).toHaveBeenCalledTimes(0);
    expect(onPressSpy2).toHaveBeenCalledTimes(0);
    expect(onPressSpy3).toHaveBeenCalledTimes(0);
  });

  it("should have base button group class", () => {
    renderWithHopeProvider(() => <Example />);

    const buttonGroup = screen.getByRole("group");

    expect(buttonGroup).toHaveClass("hope-button__group");
  });

  it("should allows custom classes", () => {
    renderWithHopeProvider(() => <Example class="test" />);

    const buttonGroup = screen.getByRole("group");

    expect(buttonGroup.getAttribute("class")).toEqual(expect.stringContaining("test"));
  });

  it("should have is attached button group class when isAttached is true", () => {
    renderWithHopeProvider(() => <Example isAttached />);

    const buttonGroup = screen.getByRole("group");

    expect(buttonGroup).toHaveClass("hope-button__group--is-attached");
  });

  it("should forward variants related classes to all buttons within", () => {
    renderWithHopeProvider(() => <Example variant="subtle" colorScheme="success" size="md" />);

    const buttonGroup = screen.getByRole("group");

    const buttons = within(buttonGroup).getAllByRole("button");

    buttons.forEach(button => {
      expect(button).toHaveClass("hope-button--subtle");
      expect(button).toHaveClass("hope-button--success");
      expect(button).toHaveClass("hope-button--md");
    });
  });
});
