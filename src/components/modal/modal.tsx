import { createContext, createEffect, createSignal, createUniqueId, JSX, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";
import { Portal } from "solid-js/web";

import { ModalContainerVariants, ModalDialogVariants, modalTransitionStyles } from "./modal.styles";

type ModalTransition = "fade-in-bottom" | "scale" | "none";

interface ModalState {
  /**
   * If `true`, the modal will be open.
   */
  opened: boolean;

  /**
   * The `id` of the modal dialog
   */
  dialogId: string;

  /**
   * The `id` of the modal dialog header
   */
  headerId: string;

  /**
   * The `id` of the modal dialog body
   */
  bodyId: string;

  /**
   * Modal opening/closing transition.
   */
  transition: ModalTransition;

  /**
   * The size of the modal dialog.
   */
  size: ModalDialogVariants["size"];

  /**
   * If `true`, the modal will be centered on screen.
   */
  centered: ModalContainerVariants["centered"];

  /**
   * Define the scrolling behavior of the modal if content overflows beyond the viewport.
   */
  scrollBehavior: ModalContainerVariants["scrollBehavior"];

  /**
   * If `true`, the modal will close when the overlay is clicked
   */
  closeOnOverlayClick: boolean;

  /**
   * If `true`, notify that the modal header component is rendered
   */
  headerMounted: boolean;

  /**
   * If `true`, notify that the modal body component is rendered
   */
  bodyMounted: boolean;

  /**
   * If `false`, focus lock will be disabled completely.
   */
  trapFocus: boolean;

  /**
   * If `true`, scrolling will be disabled on the `body` when the modal opens.
   */
  blockScrollOnMount: boolean;

  /**
   * If `true`, a `padding-right` will be applied to the body element
   * that's equal to the width of the scrollbar.
   *
   * This can help prevent some unpleasant flickering effect
   * and content adjustment when the modal opens
   */
  preserveScrollBarGap: boolean;

  /**
   * A query selector string targeting the element to receive focus when the modal opens.
   */
  initialFocus?: string;
}

interface ModalContextValue {
  state: ModalState;

  /**
   * Callback invoked to notify that modal's content exit transition is done.
   */
  onModalContentExitTransitionEnd: () => void;

  /**
   * Callback invoked to close the modal.
   */
  onClose: () => void;

  /**
   * Callback invoked when a `mouseDown` is fired on the modal container.
   */
  onMouseDown: (event: MouseEvent) => void;

  /**
   * Callback invoked when a `keyDown` is fired on the modal container.
   */
  onKeyDown: (event: KeyboardEvent) => void;

  /**
   * Callback invoked when the overlay is clicked.
   */
  onOverlayClick: (event: MouseEvent) => void;

  /**
   * Callback function to set if the modal header is mounted
   */
  setHeaderMounted: (value: boolean) => void;

  /**
   * Callback function to set if the modal body is mounted
   */
  setBodyMounted: (value: boolean) => void;
}

export interface ModalProps extends ModalContainerVariants, ModalDialogVariants {
  /**
   * If `true`, the modal will be open.
   */
  opened: boolean;

  /**
   * Callback invoked to close the modal.
   */
  onClose: () => void;

  /**
   * The `id` of the modal dialog
   */
  id?: string;

  /**
   * If `true`, the modal will close when the overlay is clicked
   */
  closeOnOverlayClick?: boolean;

  /**
   * If `true`, the modal will close when the `Esc` key is pressed
   */
  closeOnEsc?: boolean;

  /**
   * If `false`, focus lock will be disabled completely.
   *
   * This is useful in situations where you still need to interact with
   * other surrounding elements.
   *
   * 🚨Warning: We don't recommend doing this because it hurts the
   * accessibility of the modal, based on WAI-ARIA specifications.
   */
  trapFocus?: boolean;

  /**
   * A query selector string targeting the element to receive focus when the modal opens.
   */
  initialFocus?: string;

  /**
   * If `true`, scrolling will be disabled on the `body` when the modal opens.
   */
  blockScrollOnMount?: boolean;

  /**
   * If `true`, a `padding-right` will be applied to the body element
   * that's equal to the width of the scrollbar.
   *
   * This can help prevent some unpleasant flickering effect
   * and content adjustment when the modal opens
   */
  preserveScrollBarGap?: boolean;

  /**
   * Modal opening/closing transition.
   */
  transition?: ModalTransition;

  /**
   * Children of the Modal
   */
  children?: JSX.Element;

  /**
   * Callback fired when the overlay is clicked.
   */

  onOverlayClick?: () => void;

  /**
   * Callback fired when the escape key is pressed and focus is within modal
   */
  onEsc?: () => void;
}

const ModalContext = createContext<ModalContextValue>();

/**
 * Modal provides context, theming, and accessibility properties
 * to all other modal components.
 *
 * It doesn't render any DOM node.
 */
export function Modal(props: ModalProps) {
  const defaultDialogId = `hope-modal-${createUniqueId()}`;

  const [state, setState] = createStore<ModalState>({
    get opened() {
      return props.opened;
    },
    get dialogId() {
      return props.id ?? defaultDialogId;
    },
    get headerId() {
      return `${this.dialogId}--header`;
    },
    get bodyId() {
      return `${this.dialogId}--body`;
    },
    get initialFocus() {
      return props.initialFocus;
    },
    get transition() {
      return props.transition ?? "fade-in-bottom";
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
    get trapFocus() {
      return props.trapFocus ?? true;
    },
    get blockScrollOnMount() {
      return props.blockScrollOnMount ?? true;
    },
    get preserveScrollBarGap() {
      return props.preserveScrollBarGap ?? false;
    },
    headerMounted: false,
    bodyMounted: false,
  });

  /**
   * Internal state to handle modal portal `mounted` state.
   * Dirty hack since solid-transition-group doesn't work with Portal.
   */
  const [isPortalMounted, setIsPortalMounted] = createSignal(false);

  createEffect(() => {
    if (state.opened) {
      // mount portal when state `opened` is true.
      setIsPortalMounted(true);
    } else {
      // unmount portal instantly when there is no modal transition.
      state.transition === "none" && setIsPortalMounted(false);
    }
  });

  // For smooth transition, unmount portal only after modal's content exit transition is done.
  const onModalContentExitTransitionEnd = () => setIsPortalMounted(false);

  const closeOnEsc = () => props.closeOnEsc ?? true;
  const onClose = () => props.onClose();
  const setHeaderMounted = (value: boolean) => setState("headerMounted", value);
  const setBodyMounted = (value: boolean) => setState("bodyMounted", value);

  let mouseDownTarget: EventTarget | null = null;

  const onMouseDown = (event: MouseEvent) => {
    mouseDownTarget = event.target;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();

      if (closeOnEsc()) {
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
     *
     * Because it is technically not a considered "click outside".
     */
    if (mouseDownTarget !== event.target) {
      return;
    }

    if (state.closeOnOverlayClick) {
      onClose();
    }

    props.onOverlayClick?.();
  };

  const context: ModalContextValue = {
    state,
    onModalContentExitTransitionEnd,
    onClose,
    onMouseDown,
    onKeyDown,
    onOverlayClick,
    setHeaderMounted,
    setBodyMounted,
  };

  // inject global css for transitions
  modalTransitionStyles();

  return (
    <Show when={isPortalMounted()}>
      <ModalContext.Provider value={context}>
        <Portal>{props.children}</Portal>
      </ModalContext.Provider>
    </Show>
  );
}

export function useModalContext() {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("[Hope UI]: useModalContext must be used within a `<Modal />` component");
  }

  return context;
}
