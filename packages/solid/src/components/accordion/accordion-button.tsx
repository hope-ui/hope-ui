import { JSX, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { isFunction } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { callHandler, chainHandlers } from "../../utils/function";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { accordionButtonStyles } from "./accordion.styles";
import { useAccordionItemContext } from "./accordion-item";

export type AccordionButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopeAccordionButtonClass = "hope-accordion__button";

/**
 * AccordionButton is used expands and collapses an accordion item.
 * It must be a child of `AccordionItem`.
 *
 * Note 🚨: Each accordion button must be wrapped in an heading tag,
 * that is appropriate for the information architecture of the page.
 */
export function AccordionButton<C extends ElementType = "button">(props: AccordionButtonProps<C>) {
  const theme = useStyleConfig().Accordion;

  const accordionItemContext = useAccordionItemContext();

  const [local, others] = splitProps(props as AccordionButtonProps<"button">, [
    "ref",
    "class",
    "disabled",
    "onClick",
    "onFocus",
    "onKeyDown",
  ]);

  const assignRef = (el: HTMLButtonElement) => {
    accordionItemContext.registerButton(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    callHandler(local.onClick, event);

    accordionItemContext.toggleExpandedState();
  };

  const onFocus: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    callHandler(local.onFocus, event);

    accordionItemContext.setFocusedIndex();
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = event => {
    chainHandlers(local.onKeyDown, accordionItemContext.onButtonKeyDown)(event);
  };

  const classes = () => classNames(local.class, hopeAccordionButtonClass, accordionButtonStyles());

  return (
    <hope.button
      role="button"
      type="button"
      ref={assignRef}
      id={accordionItemContext.state.buttonId}
      aria-controls={accordionItemContext.state.panelId}
      aria-expanded={accordionItemContext.state.expanded}
      disabled={accordionItemContext.state.disabled}
      class={classes()}
      __baseStyle={theme?.baseStyle?.button}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      {...others}
    />
  );
}

AccordionButton.toString = () => createClassSelector(hopeAccordionButtonClass);
