import { Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useBreadcrumbContext } from "./breadcrumb";
import { breadcrumbSeparatorStyles } from "./breadcrumb.styles";

export type BreadcrumbSeparatorProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeBreadcrumbSeparatorClass = "hope-breadcrumb__separator";

/**
 * The visual separator between each breadcrumb.
 */
export function BreadcrumbSeparator<C extends ElementType = "span">(props: BreadcrumbSeparatorProps<C>) {
  const theme = useComponentStyleConfigs().Breadcrumb;

  const breadcrumbContext = useBreadcrumbContext();

  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => {
    return classNames(local.class, hopeBreadcrumbSeparatorClass, breadcrumbSeparatorStyles());
  };

  return (
    <hope.span role="presentation" class={classes()} __baseStyle={theme?.baseStyle?.separator} {...others}>
      <Show when={local.children} fallback={breadcrumbContext.state.separator}>
        {local.children}
      </Show>
    </hope.span>
  );
}

BreadcrumbSeparator.toString = () => createClassSelector(hopeBreadcrumbSeparatorClass);
