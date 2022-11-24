import { createHopeComponent, hope } from "@hope-ui/styles";
import clsx from "clsx";
import { splitProps } from "solid-js";

import { BreadcrumbStyleConfigProps, useBreadcrumbStyleConfig } from "./breadcrumb.style";
import { useBreadcrumbContext } from "./breadcrumb-context";

export const BreadcrumbSeparator = createHopeComponent<"span", BreadcrumbStyleConfigProps>(
  props => {
    const state = useBreadcrumbContext();

    const [local, styleConfigProps, others] = splitProps(
      props,
      ["class"],
      ["styleConfigOverride", "unstyled"]
    );

    const { baseClasses, styleOverrides } = useBreadcrumbStyleConfig("Breadcrumb", {
      get unstyled() {
        return styleConfigProps.unstyled;
      },
      get styleConfigOverride() {
        return styleConfigProps.styleConfigOverride;
      },
    });

    return (
      <hope.span
        class={clsx(baseClasses().separator, local.class)}
        __css={{ ...styleOverrides().separator }}
        {...others}
      >
        {state?.state.separator}
      </hope.span>
    );
  }
);
