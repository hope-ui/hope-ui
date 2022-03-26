import { cleanup, fireEvent, screen } from "solid-testing-library";

import { renderWithHopeProvider } from "@/utils/test-utils";

import { buttonStyles } from "../button/button.styles";
import { AsyncButton } from "./async-button";

describe("AsyncButton", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    cleanup();
  });

  it("should render", () => {
    // act
    renderWithHopeProvider(() => <AsyncButton />);
    const button = screen.getByRole("button");

    // assert
    expect(button).toBeInTheDocument();
  });

  it("should change state to loading and back when clicked", () => {
    // setup
    jest.useFakeTimers();
    jest.spyOn(global, "setTimeout");
    const buttonNotLoadingClass = buttonStyles({ loading: false });
    const buttonLoadingClass = buttonStyles({ loading: false });
    const handleClick = jest.fn().mockResolvedValue(() => setTimeout(Promise.resolve, 200));

    // render
    renderWithHopeProvider(() => <AsyncButton onClick={handleClick} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass(buttonNotLoadingClass.className);

    // act
    fireEvent.click(button);
    expect(button).toHaveClass(buttonLoadingClass.className);
    expect(handleClick).toBeCalled();

    // resolve
    jest.runAllTimers();
    expect(button).toHaveClass(buttonNotLoadingClass.className);
  });
});
