import { JSX, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callHandler } from "@/utils/function";

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
  const accordionItemContext = useAccordionItemContext();

  const [local, others] = splitProps(props as AccordionButtonProps<"button">, ["ref", "class", "disabled", "onClick"]);

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
    accordionItemContext.toggleExpandedState();

    callHandler(local.onClick)(event);
  };

  const classes = () => classNames(local.class, hopeAccordionButtonClass, accordionButtonStyles());

  return (
    <hope.button
      ref={assignRef}
      id={accordionItemContext.state.buttonId}
      aria-controls={accordionItemContext.state.panelId}
      aria-expanded={accordionItemContext.state.expanded}
      disabled={accordionItemContext.state.disabled}
      class={classes()}
      onClick={onClick}
      {...others}
    />
  );
}

AccordionButton.toString = () => createClassSelector(hopeAccordionButtonClass);
