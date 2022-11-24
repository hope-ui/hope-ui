import { createHopeComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import clsx from "clsx";
import { Show, splitProps } from "solid-js";

import { useBreadcrumbStyleConfig } from "./breadcrumb.style";
import { BreadcrumbLinkProps } from "./types";

export const BreadcrumbLink = createHopeComponent<any, BreadcrumbLinkProps>(props => {
  props = mergeThemeProps(
    "BreadcrumbLink",
    {
      currentPage: false,
    },
    props
  );

  const [local, styleConfigProps, others] = splitProps(
    props,
    ["currentPage", "href", "class", "children"],
    ["styleConfigOverride", "unstyled"]
  );

  const { baseClasses, styleOverrides } = useBreadcrumbStyleConfig("Breadcrumb", {
    get currentPage() {
      return local.currentPage;
    },
    get unstyled() {
      return styleConfigProps.unstyled;
    },
    get styleConfigOverride() {
      return styleConfigProps.styleConfigOverride;
    },
  });

  return (
    <Show
      when={local.currentPage}
      fallback={
        <hope.a
          href={local.href}
          __css={{ ...styleOverrides().link }}
          class={clsx(baseClasses().link, local.class)}
          {...others}
        >
          {local.children}
        </hope.a>
      }
    >
      <hope.span
        aria-current="page"
        __css={{ ...styleOverrides().link }}
        class={clsx(baseClasses().link, local.class)}
        {...others}
      >
        {local.children}
      </hope.span>
    </Show>
  );
});
