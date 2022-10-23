import { createHopeComponent, hope } from "@hope-ui/styles";
import { dataAttr } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, onCleanup, onMount, splitProps } from "solid-js";

import { useRequiredInputGroupContext } from "./input-group-context";

interface InputAddonProps {
  /** The placement of the addon outside the input. */
  addonPlacement: "left" | "right";
}

const InputAddon = createHopeComponent<"div", InputAddonProps>(props => {
  const context = useRequiredInputGroupContext();

  const [local, others] = splitProps(props, ["class", "__css", "addonPlacement"]);

  const placementStyleConfig = createMemo(() => {
    switch (local.addonPlacement) {
      case "left":
        return {
          className: context.baseClasses().leftAddon,
          styleOverride: context.styleOverrides().leftAddon,
        };
      case "right":
        return {
          className: context.baseClasses().rightAddon,
          styleOverride: context.styleOverrides().rightAddon,
        };
    }
  });

  onMount(() => {
    switch (local.addonPlacement) {
      case "left":
        context.setHasLeftAddon(true);
        onCleanup(() => context.setHasLeftAddon(false));
        break;
      case "right":
        context.setHasRightAddon(true);
        onCleanup(() => context.setHasRightAddon(false));
        break;
    }
  });

  return (
    <hope.div
      data-required={dataAttr(context.isRequired())}
      data-disabled={dataAttr(context.isDisabled())}
      data-readonly={dataAttr(context.isReadOnly())}
      data-invalid={dataAttr(context.isInvalid())}
      class={clsx(context.baseClasses().addon, placementStyleConfig().className, local.class)}
      __css={{
        ...context.styleOverrides().addon,
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
