/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/a33feaeaf8010cebd0a11583051e8fbea6cf0c0d/packages/ariakit/src/dialog/__examples__/dialog/test.tsx
 *
 * Portions of this file are based on code from chakra-ui.
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/b06b3cca679cc7083826b8629add6db6b8218928/packages/components/modal/tests/modal.test.tsx
 */

import { setupMatchMediaMock } from "@hope-ui/tests";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen } from "solid-testing-library";

import { Modal } from "./modal";
import { ModalCloseButton } from "./modal-close-button";
import { ModalContent } from "./modal-content";
import { ModalDescription } from "./modal-description";
import { ModalHeading } from "./modal-heading";
import { ModalOverlay } from "./modal-overlay";

setupMatchMediaMock();

describe("Modal", () => {
  it("should have the proper 'aria-*' attributes", async () => {
    render(() => (
      <Modal isOpen onClose={jest.fn()}>
        <ModalOverlay />
        <ModalContent data-testid="dialog">
          <ModalCloseButton />
          <ModalHeading>Title</ModalHeading>
          <ModalDescription>Description</ModalDescription>
          <p>Content</p>
        </ModalContent>
      </Modal>
    ));

    const dialog = screen.getByTestId("dialog");

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("data-ismodal", "true");
    expect(dialog).toHaveAttribute("role", "dialog");

    expect(screen.getByText("Title").id).toBe(dialog!.getAttribute("aria-labelledby"));
    expect(screen.getByText("Description").id).toBe(dialog!.getAttribute("aria-describedby"));
  });

  it("should not render when 'isOpen' is false", async () => {
    render(() => (
      <Modal isOpen={false} onClose={jest.fn()}>
        <ModalOverlay />
        <ModalContent data-testid="dialog">
          <p>Content</p>
        </ModalContent>
      </Modal>
    ));

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should trap focus", async () => {
    render(() => (
      <Modal isOpen onClose={jest.fn()}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton data-testid="close" />
          <p>Content</p>
        </ModalContent>
      </Modal>
    ));

    const closeButton = screen.getByTestId("close");

    expect(closeButton).toHaveFocus();

    await userEvent.tab();
    expect(closeButton).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(closeButton).toHaveFocus();
  });

  it("should call the 'onClose' callback when pressing 'Esc' key", async () => {
    const onCloseSpy = jest.fn();

    render(() => (
      <Modal isOpen onClose={onCloseSpy}>
        <ModalOverlay />
        <ModalContent data-testid="dialog">
          <p>Content</p>
        </ModalContent>
      </Modal>
    ));

    const dialog = screen.getByTestId("dialog");

    fireEvent.keyDown(dialog, { key: "Escape" });
    await Promise.resolve();

    expect(onCloseSpy).toHaveBeenCalled();
  });

  it("should call the 'onClose' callback when clicking outside the modal", async () => {
    const onCloseSpy = jest.fn();

    render(() => (
      <Modal isOpen onClose={onCloseSpy}>
        <ModalOverlay />
        <ModalContent data-testid="dialog">
          <p>Content</p>
        </ModalContent>
      </Modal>
    ));

    const container = screen.getByTestId("dialog").parentElement!;

    // An extra mousedown is required to get `onContainerClick` function in `modal` to work
    fireEvent.mouseDown(container);
    fireEvent.click(container);

    expect(onCloseSpy).toHaveBeenCalled();
  });

  it("should call the 'onClose' callback when clicking on the modal close button", async () => {
    const onCloseSpy = jest.fn();

    render(() => (
      <Modal isOpen onClose={onCloseSpy}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton data-testid="close" />
          <p>Content</p>
        </ModalContent>
      </Modal>
    ));

    fireEvent.click(screen.getByTestId("close"));

    expect(onCloseSpy).toHaveBeenCalled();
  });
});
