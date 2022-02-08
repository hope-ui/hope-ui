import { onCleanup, onMount, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { inputAddonStyles, InputAddonVariants } from "./input.styles";
import { useInputGroupContext } from "./input-group";

export type InputAddonProps<C extends ElementType> = HopeComponentProps<C, InputAddonVariants>;

export function InputAddon<C extends ElementType = "div">(props: InputAddonProps<C>) {
  const [local, variantProps, others] = splitProps(
    props,
    ["class"],
    ["placement", "variant", "size"]
  );

  const classes = () => classNames(local.class, inputAddonStyles(variantProps));

  return <Box class={classes()} {...others} />;
}

/* -------------------------------------------------------------------------------------------------
 * InputLeftAddon
 * -----------------------------------------------------------------------------------------------*/

const hopeInputLeftAddonClass = "hope-input-left-addon";

export function InputLeftAddon<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const inputGroup = useInputGroupContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeInputLeftAddonClass);

  onMount(() => inputGroup?.setHasLeftAddon(true));
  onCleanup(() => inputGroup?.setHasLeftAddon(false));

  return (
    <InputAddon
      class={classes()}
      placement="left"
      variant={inputGroup?.state.variant ?? "outline"}
      size={inputGroup?.state.size ?? "md"}
      {...others}
    />
  );
}

InputLeftAddon.toString = () => createCssSelector(hopeInputLeftAddonClass);

/* -------------------------------------------------------------------------------------------------
 * inputRightAddon
 * -----------------------------------------------------------------------------------------------*/

const hopeInputRightAddonClass = "hope-input-right-addon";

export function InputRightAddon<C extends ElementType = "div">(props: HopeComponentProps<C>) {
  const inputGroup = useInputGroupContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeInputRightAddonClass);

  onMount(() => inputGroup?.setHasRightAddon(true));
  onCleanup(() => inputGroup?.setHasRightAddon(false));

  return (
    <InputAddon
      class={classes()}
      placement="right"
      variant={inputGroup?.state.variant ?? "outline"}
      size={inputGroup?.state.size ?? "md"}
      {...others}
    />
  );
}

InputRightAddon.toString = () => createCssSelector(hopeInputRightAddonClass);
