import { createHopeComponent, hope } from "@hope-ui/styles";
import { splitProps } from "solid-js";

import { BreadcrumbStyleConfigProps, useBreadcrumbStyleConfig } from "./breadcrumb.style";
import { useBreadcrumbContext } from "./breadcrumb-context";

export const BreadcrumbItem = createHopeComponent<"li", BreadcrumbStyleConfigProps>(props => {
  const context = useBreadcrumbContext();

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["class", "children"],
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
    <hope.li
      gap={context?.state.gap}
      class={baseClasses().item}
      __css={{ ...styleOverrides().item }}
      {...others}
    >
      {local.children}
    </hope.li>
  );
});
