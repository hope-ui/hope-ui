import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { IconProps } from "../icon/icon";
import { IconCaretDown } from "../icons/IconCaretDown";
import { ElementType } from "../types";
import { accordionIconStyles } from "./accordion.styles";
import { useAccordionItemContext } from "./accordion-item";

export type AccordionIconProps<C extends ElementType = "svg"> = IconProps<C>;

const hopeAccordionIconClass = "hope-accordion__icon";

/**
 * AccordionIcon that gives a visual cue of the open/close state of the accordion item.
 * It rotates `180deg` based on the open/close state.
 */
export function AccordionIcon<C extends ElementType = "svg">(props: AccordionIconProps<C>) {
  const theme = useStyleConfig().Accordion;

  const accordionItemContext = useAccordionItemContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(
      local.class,
      hopeAccordionIconClass,
      accordionIconStyles({
        expanded: accordionItemContext.state.expanded,
        disabled: accordionItemContext.state.disabled,
      })
    );
  };

  return (
    <IconCaretDown aria-hidden class={classes()} __baseStyle={theme?.baseStyle?.icon} {...others} />
  );
}

AccordionIcon.toString = () => createClassSelector(hopeAccordionIconClass);
