import {
  itIsPolymorphic,
  itRendersChildren,
  itSupportsClass,
  itSupportsRef,
  itSupportsStyle,
} from "@hope-ui/tests";
import userEvent from "@testing-library/user-event";
import { createSignal, Show } from "solid-js";
import { fireEvent, render, screen } from "solid-testing-library";

import { FocusTrap, FocusTrapProps } from "./focus-trap";

const defaultProps: FocusTrapProps = {};

describe("FocusTrap", () => {
  itIsPolymorphic(FocusTrap as any, { "data-testid": "focus-trap" }, "[data-testid='focus-trap']");
  itRendersChildren(FocusTrap as any, defaultProps);
  itSupportsClass(FocusTrap as any, defaultProps);
  itSupportsRef(FocusTrap as any, defaultProps, HTMLDivElement);
  itSupportsStyle(FocusTrap as any, { "data-testid": "focus-trap" }, "[data-testid='focus-trap']");

  it("should focus element with default 'initialFocusSelector' on mount", () => {
    render(() => (
      <FocusTrap>
        <button>Button 1</button>
        <button data-autofocus>Button 2</button>
      </FocusTrap>
    ));

    expect(screen.getByText("Button 2")).toHaveFocus();
  });

  it("should focus element with custom 'initialFocusSelector' on mount", () => {
    render(() => (
      <FocusTrap initialFocusSelector="#first">
        <button>Button 1</button>
        <button id="first">Button 2</button>
      </FocusTrap>
    ));

    expect(screen.getByText("Button 2")).toHaveFocus();
  });

  it("should focus first focusable element on mount when 'autoFocus' is true", async () => {
    render(() => (
      <FocusTrap autoFocus>
        <button>Button</button>
      </FocusTrap>
    ));

    expect(screen.getByText("Button")).toHaveFocus();
  });

  it("should fallbacks to container focus if no focusable elements are found", async () => {
    render(() => (
      <>
        <button>Before</button>
        <FocusTrap data-testid="focus-trap" />
        <button>After</button>
      </>
    ));

    await userEvent.tab();
    expect(screen.getByText("Before")).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByTestId("focus-trap")).toHaveFocus();

    // focus remains on the focus trap container
    await userEvent.tab();
    expect(screen.getByTestId("focus-trap")).toHaveFocus();
  });

  it("can be disabled", async () => {
    render(() => (
      <>
        <button>Before</button>
        <FocusTrap isDisabled>
          <button>Button</button>
        </FocusTrap>
        <button>After</button>
      </>
    ));

    await userEvent.tab();
    expect(screen.getByText("Before")).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByText("Button")).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByText("After")).toHaveFocus();
  });

  it("should focus element with 'finalFocusSelector' on unmount", async () => {
    const Example = () => {
      const [isOpen, setIsOpen] = createSignal(false);

      return (
        <>
          <button onClick={() => setIsOpen(true)}>Open</button>
          <Show when={isOpen()}>
            <FocusTrap finalFocusSelector="#last" data-testid="focus-trap">
              <button onClick={() => setIsOpen(false)}>Close</button>
            </FocusTrap>
          </Show>
          <button id="last">Last</button>
        </>
      );
    };

    render(() => <Example />);

    expect(screen.queryByTestId("focus-trap")).toBeNull();

    const openButton = screen.getByText("Open") as HTMLButtonElement;

    await userEvent.tab();
    expect(openButton).toHaveFocus();

    fireEvent.click(openButton);
    await Promise.resolve();

    const focusTrap = screen.getByTestId("focus-trap");
    expect(focusTrap).toBeInTheDocument();

    const closeButton = screen.getByText("Close") as HTMLButtonElement;

    await userEvent.tab();
    expect(closeButton).toHaveFocus();

    fireEvent.click(closeButton);
    await Promise.resolve();

    expect(screen.queryByText("Last")).toHaveFocus();
  });

  it("should focus previous active element on unmount when 'restoreFocus' is true", async () => {
    const Example = () => {
      const [isOpen, setIsOpen] = createSignal(false);

      return (
        <>
          <button onClick={() => setIsOpen(true)}>Open</button>
          <Show when={isOpen()}>
            <FocusTrap restoreFocus data-testid="focus-trap">
              <button onClick={() => setIsOpen(false)}>Close</button>
            </FocusTrap>
          </Show>
        </>
      );
    };

    render(() => <Example />);

    expect(screen.queryByTestId("focus-trap")).toBeNull();

    const openButton = screen.getByText("Open") as HTMLButtonElement;

    await userEvent.tab();
    expect(openButton).toHaveFocus();

    fireEvent.click(openButton);
    await Promise.resolve();

    const focusTrap = screen.getByTestId("focus-trap");
    expect(focusTrap).toBeInTheDocument();

    const closeButton = screen.getByText("Close") as HTMLButtonElement;

    await userEvent.tab();
    expect(closeButton).toHaveFocus();

    fireEvent.click(closeButton);
    await Promise.resolve();

    expect(openButton).toHaveFocus();
  });

  it("should ignore 'restoreFocus' when 'finalFocusSelector' is set", async () => {
    const Example = () => {
      const [isOpen, setIsOpen] = createSignal(false);

      return (
        <>
          <button onClick={() => setIsOpen(true)}>Open</button>
          <Show when={isOpen()}>
            <FocusTrap restoreFocus finalFocusSelector="#last" data-testid="focus-trap">
              <button onClick={() => setIsOpen(false)}>Close</button>
            </FocusTrap>
          </Show>
          <button id="last">Last</button>
        </>
      );
    };

    render(() => <Example />);

    expect(screen.queryByTestId("focus-trap")).toBeNull();

    const openButton = screen.getByText("Open") as HTMLButtonElement;

    await userEvent.tab();
    expect(openButton).toHaveFocus();

    fireEvent.click(openButton);
    await Promise.resolve();

    const focusTrap = screen.getByTestId("focus-trap");
    expect(focusTrap).toBeInTheDocument();

    const closeButton = screen.getByText("Close") as HTMLButtonElement;

    await userEvent.tab();
    expect(closeButton).toHaveFocus();

    fireEvent.click(closeButton);
    await Promise.resolve();

    expect(screen.queryByText("Last")).toHaveFocus();
  });
});
