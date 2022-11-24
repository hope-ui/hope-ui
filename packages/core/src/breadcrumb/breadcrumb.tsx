import { createHopeComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import clsx from "clsx";
import { splitProps } from "solid-js";
import { createStore } from "solid-js/store";

import { useBreadcrumbStyleConfig } from "./breadcrumb.style";
import { BreadcrumbContext } from "./breadcrumb-context";
import { BreadcrumbProps } from "./types";

export const Breadcrumb = createHopeComponent<"nav", BreadcrumbProps>(props => {
  const dprops = mergeThemeProps(
    "Breadcrumb",
    {
      separator: "/",
      spacing: "0.5rem",
    },
    props
  );

  const [local, styleConfigProps, others] = splitProps(
    dprops,
    ["class", "children", "spacing", "separator"],
    ["styleConfigOverride", "unstyled"]
  );

  const [state] = createStore({
    get gap() {
      return local.spacing;
    },
    get separator() {
      return local.separator;
    },
  });

  const { baseClasses, styleOverrides } = useBreadcrumbStyleConfig("Breadcrumb", {
    get unstyled() {
      return styleConfigProps.unstyled;
    },
    get styleConfigOverride() {
      return styleConfigProps.styleConfigOverride;
    },
  });

  const context = { state };

  return (
    <BreadcrumbContext.Provider value={context}>
      <hope.nav
        aria-label="breadcrumb"
        __css={{ ...styleOverrides().root }}
        class={clsx(baseClasses().root, local.class)}
        {...others}
      >
        <hope.ol class={clsx(baseClasses().list)} gap={state.gap}>
          {local.children}
        </hope.ol>
      </hope.nav>
    </BreadcrumbContext.Provider>
  );
});
