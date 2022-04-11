import { Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { IconCloseSmall } from "../icons/IconCloseSmall";
import { ElementType, HTMLHopeProps } from "../types";
import { selectTagCloseButtonStyles } from "./select.styles";

export type SelectTagCloseButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopeSelectTagCloseButtonClass = "hope-select__tag-close-button";

/**
 * The close button that sit inside a `SelectTag`.
 * Used to remove an option in a multi-select.
 */
export function SelectTagCloseButton<C extends ElementType = "button">(props: SelectTagCloseButtonProps<C>) {
  const theme = useStyleConfig().Select;

  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => classNames(local.class, hopeSelectTagCloseButtonClass, selectTagCloseButtonStyles());

  return (
    <hope.button
      type="button"
      role="button"
      aria-label="Delete"
      tabIndex="-1"
      class={classes()}
      __baseStyle={theme?.baseStyle?.tagCloseButton}
      {...others}
    >
      <Show when={local.children} fallback={<IconCloseSmall />}>
        {local.children}
      </Show>
    </hope.button>
  );
}

SelectTagCloseButton.toString = () => createClassSelector(hopeSelectTagCloseButtonClass);
