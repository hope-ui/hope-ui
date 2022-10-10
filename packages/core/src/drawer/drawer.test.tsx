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
 * https://github.com/chakra-ui/chakra-ui/blob/b06b3cca679cc7083826b8629add6db6b8218928/packages/components/drawer/tests/drawer.test.tsx
 */

import { setupMatchMediaMock } from "@hope-ui/tests";
import userEvent from "@testing-library/user-event";
import { fireEvent, render, screen } from "solid-testing-library";

import { Drawer } from "./drawer";
import { DrawerCloseButton } from "./drawer-close-button";
import { DrawerContent } from "./drawer-content";
import { DrawerDescription } from "./drawer-description";
import { DrawerHeading } from "./drawer-heading";
import { DrawerOverlay } from "./drawer-overlay";

setupMatchMediaMock();

describe("Drawer", () => {
  it("should have the proper 'aria-*' attributes", async () => {
    render(() => (
      <Drawer isOpen onClose={jest.fn()}>
        <DrawerOverlay />
        <DrawerContent data-testid="dialog">
          <DrawerCloseButton />
          <DrawerHeading>Title</DrawerHeading>
          <DrawerDescription>Description</DrawerDescription>
          <p>Content</p>
        </DrawerContent>
      </Drawer>
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
      <Drawer isOpen={false} onClose={jest.fn()}>
        <DrawerOverlay />
        <DrawerContent data-testid="dialog">
          <p>Content</p>
        </DrawerContent>
      </Drawer>
    ));

    expect(screen.queryByTestId("dialog")).not.toBeInTheDocument();
  });

  it("should trap focus", async () => {
    render(() => (
      <Drawer isOpen onClose={jest.fn()}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton data-testid="close" />
          <p>Content</p>
        </DrawerContent>
      </Drawer>
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
      <Drawer isOpen onClose={onCloseSpy}>
        <DrawerOverlay />
        <DrawerContent data-testid="dialog">
          <p>Content</p>
        </DrawerContent>
      </Drawer>
    ));

    const dialog = screen.getByTestId("dialog");

    fireEvent.keyDown(dialog, { key: "Escape" });
    await Promise.resolve();

    expect(onCloseSpy).toHaveBeenCalled();
  });

  it("should call the 'onClose' callback when clicking outside the drawer", async () => {
    const onCloseSpy = jest.fn();

    render(() => (
      <Drawer isOpen onClose={onCloseSpy}>
        <DrawerOverlay />
        <DrawerContent data-testid="dialog">
          <p>Content</p>
        </DrawerContent>
      </Drawer>
    ));

    const container = screen.getByTestId("dialog").parentElement!;

    // An extra mousedown is required to get `onContainerClick` function in `drawer` to work
    fireEvent.mouseDown(container);
    fireEvent.click(container);

    expect(onCloseSpy).toHaveBeenCalled();
  });

  it("should call the 'onClose' callback when clicking on the drawer close button", async () => {
    const onCloseSpy = jest.fn();

    render(() => (
      <Drawer isOpen onClose={onCloseSpy}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton data-testid="close" />
          <p>Content</p>
        </DrawerContent>
      </Drawer>
    ));

    fireEvent.click(screen.getByTestId("close"));

    expect(onCloseSpy).toHaveBeenCalled();
  });
});
