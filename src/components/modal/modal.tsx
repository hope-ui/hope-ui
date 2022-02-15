import { createContext, createUniqueId, JSX, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";

import { ModalContentContainerVariants, ModalContentVariants } from "./modal.styles";

interface ModalState {
  dialogId: string;
  headerId: string;
  bodyId: string;
  isOpen: boolean;
  initialFocus?: string;
  size: ModalContentVariants["size"];
  centered: ModalContentContainerVariants["centered"];
  scrollBehavior: ModalContentContainerVariants["scrollBehavior"];
  closeOnOverlayClick: boolean;
  closeOnEsc: boolean;
  headerMounted: boolean;
  bodyMounted: boolean;
}

interface ModalContextValue {
  state: ModalState;

  /**
   * Callback invoked to close the modal.
   */
  onClose: () => void;

  onOverlayClick: (event: MouseEvent) => void;

  onKeyUp: (event: KeyboardEvent) => void;

  onMouseDown: (event: MouseEvent) => void;

  /**
   * Callback function to set if the modal header is mounted
   */
  setHeaderMounted: (value: boolean) => void;

  /**
   * Callback function to set if the modal body is mounted
   */
  setBodyMounted: (value: boolean) => void;
}

const ModalContext = createContext<ModalContextValue>();

export function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("[Hope UI]: useModalContext must be used within a `<Modal />` component");
  }

  return context;
}

export interface ModalProps extends ModalContentContainerVariants, ModalContentVariants {
  /**
   * If `true`, the modal will be open.
   */
  isOpen: boolean;

  /**
   * Callback invoked to close the modal.
   */
  onClose: () => void;

  /**
   * The `id` of the modal
   */
  id?: string;

  /**
   * If `true`, the modal will close when the overlay is clicked
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * If `true`, the modal will close when the `Esc` key is pressed
   * @default true
   */
  closeOnEsc?: boolean;

  /**
   * A query selector string targeting the element to receive focus when the modal opens.
   */
  initialFocus?: string;

  /**
   * Callback fired when the overlay is clicked.
   */

  onOverlayClick?: () => void;
  /**
   * Callback fired when the escape key is pressed and focus is within modal
   */
  onEsc?: () => void;

  /**
   * Children of the Modal
   */
  children?: JSX.Element;
}

/**
 * Modal provides context, theming, and accessibility properties
 * to all other modal components.
 *
 * It doesn't render any DOM node.
 */
export function Modal(props: ModalProps) {
  const defaultDialogId = `hope-modal-${createUniqueId().replace(":", "-")}`;

  const [state, setState] = createStore<ModalState>({
    get dialogId() {
      return props.id ?? defaultDialogId;
    },
    get headerId() {
      return `${this.dialogId}--header`;
    },
    get bodyId() {
      return `${this.dialogId}--body`;
    },
    get isOpen() {
      return props.isOpen;
    },
    get initialFocus() {
      return props.initialFocus;
    },
    get size() {
      return props.size ?? "md";
    },
    get centered() {
      return props.centered ?? false;
    },
    get scrollBehavior() {
      return props.scrollBehavior ?? "outside";
    },
    get closeOnOverlayClick() {
      return props.closeOnOverlayClick ?? true;
    },
    get closeOnEsc() {
      return props.closeOnEsc ?? true;
    },
    headerMounted: false,
    bodyMounted: false,
  });

  const onClose = () => props.onClose();
  const setHeaderMounted = (value: boolean) => setState("headerMounted", value);
  const setBodyMounted = (value: boolean) => setState("bodyMounted", value);

  let mouseDownTarget: EventTarget | null = null;

  const onMouseDown = (event: MouseEvent) => {
    mouseDownTarget = event.target;
  };

  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();

      if (state.closeOnEsc) {
        onClose();
      }

      props.onEsc?.();
    }
  };

  const onOverlayClick = (event: MouseEvent) => {
    event.stopPropagation();
    /**
     * Prevent the modal from closing when user
     * start dragging from the content, and release drag outside the content.
     */
    if (mouseDownTarget !== event.target) return;

    if (state.closeOnOverlayClick) {
      onClose();
    }

    props.onOverlayClick?.();
  };

  const context: ModalContextValue = {
    state,
    onClose,
    onOverlayClick,
    onMouseDown,
    onKeyUp,
    setHeaderMounted,
    setBodyMounted,
  };

  return (
    <Show when={props.isOpen}>
      <ModalContext.Provider value={context}>
        <Portal>{props.children}</Portal>
      </ModalContext.Provider>
    </Show>
  );
}
