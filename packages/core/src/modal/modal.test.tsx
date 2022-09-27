/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/a33feaeaf8010cebd0a11583051e8fbea6cf0c0d/packages/ariakit/src/dialog/__examples__/dialog/test.tsx
 */

import { setupMatchMediaMock } from "@hope-ui/tests";
import userEvent from "@testing-library/user-event";
import { createSignal } from "solid-js";
import { fireEvent, render, screen } from "solid-testing-library";

import { Modal } from "./modal";
import { ModalCloseButton } from "./modal-close-button";
import { ModalContent } from "./modal-content";
import { ModalDescription } from "./modal-description";
import { ModalHeading } from "./modal-heading";
import { ModalOverlay } from "./modal-overlay";

function Example() {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      <Modal
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        modalTransitionOptions={{
          duration: 0,
          exitDuration: 0,
          delay: 0,
          exitDelay: 0,
        }}
      >
        <ModalOverlay data-testid="backdrop" />
        <ModalContent>
          <ModalCloseButton data-testid="close-button" />
          <ModalHeading>Title</ModalHeading>
          <ModalDescription>Description</ModalDescription>
          <p>Content</p>
        </ModalContent>
      </Modal>
    </>
  );
}

const getTrigger = () => screen.getByText("Open");
const getDialog = () => screen.queryByRole("dialog");
const getCloseButton = () => screen.getByTestId("close-button");

setupMatchMediaMock();

describe("Modal", () => {
  it("should show when 'isOpen' is true", async () => {
    render(() => <Example />);

    expect(getDialog()).not.toBeInTheDocument();

    fireEvent.click(getTrigger());
    await Promise.resolve();

    expect(getDialog()).toBeVisible();
    expect(getCloseButton()).toHaveFocus();
  });

  it("should trap focus", async () => {
    render(() => <Example />);

    expect(getDialog()).not.toBeInTheDocument();

    fireEvent.click(getTrigger());
    await Promise.resolve();

    expect(getDialog()).toBeVisible();
    expect(getCloseButton()).toHaveFocus();

    await userEvent.tab();
    expect(getCloseButton()).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(getCloseButton()).toHaveFocus();
  });

  it("should close on escape", async () => {
    render(() => <Example />);

    expect(getDialog()).not.toBeInTheDocument();

    getTrigger().focus();
    await Promise.resolve();

    fireEvent.click(getTrigger());
    await Promise.resolve();

    const dialog = getDialog()!;

    expect(dialog).toBeVisible();

    fireEvent.keyDown(dialog, { key: "Escape" });
    await Promise.resolve();

    expect(dialog).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });

  it.skip("should close on outside click", async () => {
    render(() => <Example />);

    expect(getDialog()).not.toBeInTheDocument();

    getTrigger().focus();
    await Promise.resolve();

    fireEvent.click(getTrigger());
    await Promise.resolve();

    const dialog = getDialog();

    expect(dialog).toBeVisible();

    fireEvent.click(screen.getByTestId("backdrop"));
    await Promise.resolve();

    expect(dialog).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });

  it("should close on 'ModalCloseButton' click", async () => {
    render(() => <Example />);

    expect(getDialog()).not.toBeInTheDocument();

    getTrigger().focus();
    await Promise.resolve();

    fireEvent.click(getTrigger());
    await Promise.resolve();

    const dialog = getDialog();

    expect(dialog).toBeVisible();

    fireEvent.click(getCloseButton());
    await Promise.resolve();

    expect(dialog).not.toBeInTheDocument();
    expect(getTrigger()).toHaveFocus();
  });
});
