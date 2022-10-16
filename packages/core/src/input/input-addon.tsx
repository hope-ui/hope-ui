import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createMemo, onCleanup, onMount, splitProps } from "solid-js";

import { useInputGroupContext } from "./input-group-context";

interface InputAddonProps {
  /** The placement of the addon outside the input. */
  addonPlacement: "left" | "right";
}

const InputAddon = createHopeComponent<"div", InputAddonProps>(props => {
  const context = useInputGroupContext();

  const [local, others] = splitProps(props, ["class", "__css", "addonPlacement"]);

  const placementStyleConfig = createMemo(() => {
    switch (local.addonPlacement) {
      case "left":
        return {
          className: context?.baseClasses().leftAddon,
          styleOverride: context?.styleOverrides().leftAddon,
        };
      case "right":
        return {
          className: context?.baseClasses().rightAddon,
          styleOverride: context?.styleOverrides().rightAddon,
        };
    }
  });

  onMount(() => {
    switch (local.addonPlacement) {
      case "left":
        context?.setHasLeftAddon(true);
        onCleanup(() => context?.setHasLeftAddon(false));
        break;
      case "right":
        context?.setHasRightAddon(true);
        onCleanup(() => context?.setHasRightAddon(false));
        break;
    }
  });

  return (
    <hope.div
      data-required={context?.isRequired() || undefined}
      data-disabled={context?.isDisabled() || undefined}
      data-readonly={context?.isReadOnly() || undefined}
      data-invalid={context?.isInvalid() || undefined}
      class={clsx(context?.baseClasses().addon, placementStyleConfig().className, local.class)}
      __css={{
        ...context?.styleOverrides().addon,
        ...placementStyleConfig().styleOverride,
        ...local.__css,
      }}
      {...others}
    />
  );
});

export const InputLeftAddon = createHopeComponent<"div">(props => {
  return <InputAddon addonPlacement="left" {...props} />;
});

export const InputRightAddon = createHopeComponent<"div">(props => {
  return <InputAddon addonPlacement="right" {...props} />;
});
