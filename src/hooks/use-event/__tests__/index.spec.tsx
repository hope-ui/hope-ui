import { createSignal } from "solid-js";
import { cleanup, render, screen } from "solid-testing-library";

import { useEvent } from "../";

describe("useEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  it("should call handle", () => {
    let _event;
    let _handle: any;
    const addEventListener = jest.fn((event, handle) => {
      _event = event;
      _handle = handle;
    });
    const removeEventListener = jest.fn();
    const elementMock: any = {
      addEventListener,
      removeEventListener,
    };

    const wrapper = render(() => {
      const [state, setState] = createSignal(1);
      useEvent({
        element: elementMock,
        eventName: "click",
        handler: () => setState(value => value + 1),
      });
      return <div data-testid="element">{state()}</div>;
    });

    expect(addEventListener).toBeCalled();
    expect(_event).toBe("click");
    expect(typeof _handle).toBe("function");
    const element = screen.getByTestId("element");
    expect(element).toHaveTextContent("1");
    _handle();
    expect(element).toHaveTextContent("2");

    wrapper.unmount();
    expect(removeEventListener).toBeCalled();
    expect(removeEventListener).toBeCalledWith(_event, _handle);
  });
});
