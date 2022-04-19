import { splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { Collapse } from "../collapse/collapse";
import { ElementType, HTMLHopeProps } from "../types";
import { accordionPanelStyles } from "./accordion.styles";
import { useAccordionItemContext } from "./accordion-item";

export type AccordionPanelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeAccordionPanelClass = "hope-accordion__panel";

/**
 * Accordion panel that holds the content for each accordion.
 * It shows and hides based on the state from the `AccordionItem`.
 *
 * It uses the `Collapse` component to animate its height.
 */
export function AccordionPanel<C extends ElementType = "div">(props: AccordionPanelProps<C>) {
  const theme = useStyleConfig().Accordion;

  const accordionItemContext = useAccordionItemContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeAccordionPanelClass, accordionPanelStyles());

  return (
    <Collapse expanded={accordionItemContext.state.expanded}>
      <Box
        role="region"
        id={accordionItemContext.state.panelId}
        aria-labelledby={accordionItemContext.state.buttonId}
        class={classes()}
        __baseStyle={theme?.baseStyle?.panel}
        {...others}
      />
    </Collapse>
  );
}

AccordionPanel.toString = () => createClassSelector(hopeAccordionPanelClass);
