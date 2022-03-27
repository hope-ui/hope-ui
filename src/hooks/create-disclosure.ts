import { createSignal, createUniqueId } from "solid-js";

export interface CreateDisclosureProps {
  id?: string;
  isOpen?: boolean;
  defaultIsOpen?: boolean;
  onOpen?(): void;
  onClose?(): void;
}

/**
 * Custom hook used to help handle common open, close, or toggle scenarios.
 * It can be used to control component such as Modal, Drawer, etc.
 */
export function createDisclosure(props: CreateDisclosureProps = {}) {
  const id = `disclosure-${createUniqueId()}`;

  const [isOpenState, setIsOpenState] = createSignal(props.defaultIsOpen || false);

  const isControlled = () => props.isOpen !== undefined;

  const isOpen = () => (isControlled() ? !!props.isOpen : isOpenState());

  const onClose = () => {
    if (!isControlled()) {
      setIsOpenState(false);
    }

    props.onClose?.();
  };

  const onOpen = () => {
    if (!isControlled()) {
      setIsOpenState(true);
    }

    props.onOpen?.();
  };

  const onToggle = () => {
    isOpen() ? onClose() : onOpen();
  };

  const triggerProps = () => ({
    "aria-expanded": isOpen(),
    "aria-controls": id,
  });

  const disclosureProps = () => ({
    id,
    hidden: !isOpen(),
  });

  return {
    isControlled,
    isOpen,
    onOpen,
    onClose,
    onToggle,
    triggerProps,
    disclosureProps,
  };
}
