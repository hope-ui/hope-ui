import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { createMemo, onCleanup, onMount, splitProps } from "solid-js";

import { useInputGroupContext } from "./input-group-context";

interface InputSectionProps {
  /** The placement of the section inside the input. */
  sectionPlacement: "left" | "right";
}

const InputSection = createHopeComponent<"div", InputSectionProps>(props => {
  const context = useInputGroupContext();

  const [local, others] = splitProps(props, ["class", "__css", "sectionPlacement"]);

  const placementStyleConfig = createMemo(() => {
    switch (local.sectionPlacement) {
      case "left":
        return {
          className: context?.baseClasses().leftSection,
          styleOverride: context?.styleOverrides().leftSection,
        };
      case "right":
        return {
          className: context?.baseClasses().rightSection,
          styleOverride: context?.styleOverrides().rightSection,
        };
    }
  });

  onMount(() => {
    switch (local.sectionPlacement) {
      case "left":
        context?.setHasLeftSection(true);
        onCleanup(() => context?.setHasLeftSection(false));
        break;
      case "right":
        context?.setHasRightSection(true);
        onCleanup(() => context?.setHasRightSection(false));
        break;
    }
  });

  return (
    <hope.div
      data-required={context?.isRequired() || undefined}
      data-disabled={context?.isDisabled() || undefined}
      data-readonly={context?.isReadOnly() || undefined}
      data-invalid={context?.isInvalid() || undefined}
      class={clsx(context?.baseClasses().section, placementStyleConfig().className, local.class)}
      __css={{
        ...context?.styleOverrides().section,
        ...placementStyleConfig().styleOverride,
        ...local.__css,
      }}
      {...others}
    />
  );
});

export const InputLeftSection = createHopeComponent<"div">(props => {
  return <InputSection sectionPlacement="left" {...props} />;
});

export const InputRightSection = createHopeComponent<"div">(props => {
  return <InputSection sectionPlacement="right" {...props} />;
});
