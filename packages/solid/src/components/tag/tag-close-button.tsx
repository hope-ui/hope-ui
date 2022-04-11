import { mergeProps, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { IconCloseSmall } from "../icons/IconCloseSmall";
import { ElementType, HTMLHopeProps } from "../types";
import { useTagContext } from "./tag";
import { tagCloseButtonStyles } from "./tag.styles";

interface TagCloseButtonOptions {
  "aria-label"?: string;
}

export type TagCloseButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C, TagCloseButtonOptions>;

const hopeTagCloseButtonClass = "hope-tag-close-button";

/**
 * TagCloseButton is used to close "remove" the tag
 */
export function TagCloseButton<C extends ElementType = "button">(props: TagCloseButtonProps<C>) {
  const theme = useStyleConfig().Tag;

  const tagContext = useTagContext();

  const defaultProps: TagCloseButtonProps<"button"> = {
    type: "button",
    role: "button",
    "aria-label": "Close",
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault as TagCloseButtonProps<C>, ["class", "children"]);

  const classes = () =>
    classNames(
      local.class,
      hopeTagCloseButtonClass,
      tagCloseButtonStyles({
        size: tagContext.size(),
      })
    );

  return (
    <hope.button class={classes()} __baseStyle={theme?.baseStyle?.closeButton} {...others}>
      <IconCloseSmall />
    </hope.button>
  );
}

TagCloseButton.toString = () => createClassSelector(hopeTagCloseButtonClass);
