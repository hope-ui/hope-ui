import { onCleanup, onMount, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { inputElementStyles, InputElementVariants } from "./input.styles";
import { useInputGroupContext } from "./input-group";

export type InputElementProps<C extends ElementType = "div"> = HTMLHopeProps<C, InputElementVariants>;

export function InputElement<C extends ElementType = "div">(props: InputElementProps<C>) {
  const theme = useComponentStyleConfigs().Input;

  const [local, variantProps, others] = splitProps(props, ["class"], ["placement", "size"]);

  const classes = () => classNames(local.class, inputElementStyles(variantProps));

  return <Box class={classes()} __baseStyle={theme?.baseStyle?.element} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * InputLeftElement
 * -----------------------------------------------------------------------------------------------*/

export type InputLeftElementProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeInputLeftElementClass = "hope-input-left-element";

export function InputLeftElement<C extends ElementType = "div">(props: InputLeftElementProps<C>) {
  const inputGroup = useInputGroupContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeInputLeftElementClass);

  onMount(() => inputGroup?.setHasLeftElement(true));
  onCleanup(() => inputGroup?.setHasLeftElement(false));

  return <InputElement class={classes()} placement="left" size={inputGroup?.state.size ?? "md"} {...others} />;
}

InputLeftElement.toString = () => createClassSelector(hopeInputLeftElementClass);

/* -------------------------------------------------------------------------------------------------
 * InputRightElement
 * -----------------------------------------------------------------------------------------------*/

export type InputRightElementProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeInputRightElementClass = "hope-input-right-element";

export function InputRightElement<C extends ElementType = "div">(props: InputRightElementProps<C>) {
  const inputGroup = useInputGroupContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeInputRightElementClass);

  onMount(() => inputGroup?.setHasRightElement(true));
  onCleanup(() => inputGroup?.setHasRightElement(false));

  return <InputElement class={classes()} placement="right" size={inputGroup?.state.size ?? "md"} {...others} />;
}

InputRightElement.toString = () => createClassSelector(hopeInputRightElementClass);
