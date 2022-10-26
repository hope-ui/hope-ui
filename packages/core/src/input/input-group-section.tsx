import { createHopeComponent, hope } from "@hope-ui/styles";
import { dataAttr } from "@hope-ui/utils";
import { clsx } from "clsx";
import { createMemo, onCleanup, onMount, splitProps } from "solid-js";

import { useRequiredInputGroupContext } from "./input-group-context";

interface InputGroupSectionProps {
  /** The placement of the section inside the input. */
  sectionPlacement: "left" | "right";
}

const InputGroupSection = createHopeComponent<"div", InputGroupSectionProps>(props => {
  const context = useRequiredInputGroupContext();

  const [local, others] = splitProps(props, ["class", "__css", "sectionPlacement"]);

  const placementStyleConfig = createMemo(() => {
    switch (local.sectionPlacement) {
      case "left":
        return {
          className: context.baseClasses().leftSection,
          styleOverride: context.styleOverrides().leftSection,
        };
      case "right":
        return {
          className: context.baseClasses().rightSection,
          styleOverride: context.styleOverrides().rightSection,
        };
    }
  });

  onMount(() => {
    switch (local.sectionPlacement) {
      case "left":
        context.setHasLeftSection(true);
        onCleanup(() => context.setHasLeftSection(false));
        break;
      case "right":
        context.setHasRightSection(true);
        onCleanup(() => context.setHasRightSection(false));
        break;
    }
  });

  return (
    <hope.div
      data-required={dataAttr(context.isRequired())}
      data-disabled={dataAttr(context.isDisabled())}
      data-readonly={dataAttr(context.isReadOnly())}
      data-invalid={dataAttr(context.isInvalid())}
      class={clsx(context.baseClasses().section, placementStyleConfig().className, local.class)}
      __css={{
        ...context.styleOverrides().section,
        ...placementStyleConfig().styleOverride,
        ...local.__css,
      }}
      {...others}
    />
  );
});

export const InputGroupLeftSection = createHopeComponent<"div">(props => {
  return <InputGroupSection sectionPlacement="left" {...props} />;
});

export const InputGroupRightSection = createHopeComponent<"div">(props => {
  return <InputGroupSection sectionPlacement="right" {...props} />;
});
