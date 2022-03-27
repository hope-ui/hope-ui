import { cleanup, fireEvent, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { buttonStyles } from "../button/button.styles";
import { AsyncButton } from "./async-button";

describe("AsyncButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <AsyncButton />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInTheDocument();
  });

  it("should change state to loading and back when clicked", async () => {
    // setup
    const buttonLoadingClass = buttonStyles({ loading: true });
    const handleClick = jest.fn(async () => undefined);

    // render still button
    renderWithHopeProvider(() => <AsyncButton onClick={handleClick} />);
    const button = screen.getByRole("button");
    expect(button.className.split(" ")).not.toEqual(expect.arrayContaining(buttonLoadingClass.className.split(" ")));

    // make it loading
    fireEvent.click(button);
    expect(button.className.split(" ")).toEqual(expect.arrayContaining(buttonLoadingClass.className.split(" ")));
    expect(handleClick).toBeCalled();

    // next tick resolve back to still button
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(button.className.split(" ")).not.toEqual(expect.arrayContaining(buttonLoadingClass.className.split(" ")));
  });
});
