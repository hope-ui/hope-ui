import { createHopeComponent, hope, mergeThemeProps } from "@hope-ui/styles";
import clsx from "clsx";
import { children, createSignal, splitProps } from "solid-js";
import { createStore } from "solid-js/store";
import { ResolvedJSXElement } from "solid-js/types/reactive/signal";

import { Button, ButtonProps } from "../button";
import { useBreadcrumbStyleConfig } from "./breadcrumb.style";
import { BreadcrumbContext } from "./breadcrumb-context";
import { BreadcrumbSeparator } from "./breadcrumb-separator";
import { BreadcrumbListProps, BreadcrumbProps } from "./types";

const CollapseButton = createHopeComponent<"button", ButtonProps>(props => {
  return (
    <Button height={"4"} size="xs" aria-label="Show path" {...props}>
      ···
    </Button>
  );
});

const BreadcrumbList = createHopeComponent<"ol", BreadcrumbListProps>(props => {
  const [expandable, setExpandable] = createSignal(false);

  const resolved = children(() => props.children);
  const itemsQuantity = () => resolved.toArray();

  const renderWithCollapse = (resovledItems: ResolvedJSXElement[]) => {
    return [
      ...resovledItems.slice(0, props.itemsBeforeCollapse),
      <CollapseButton
        onClick={() => {
          setExpandable(true);
          console.log(expandable());
          return {};
        }}
      />,
      <BreadcrumbSeparator />,
      ...resovledItems.slice(
        resovledItems.length - (props?.itemsAfterCollapse || 1),
        resovledItems.length
      ),
    ] as ResolvedJSXElement[];
  };

  return (
    <hope.ol {...props}>
      {expandable() || (props.maxItem && itemsQuantity().length < props.maxItem)
        ? resolved()
        : renderWithCollapse(itemsQuantity())}
    </hope.ol>
  );
});

export const Breadcrumb = createHopeComponent<"nav", BreadcrumbProps>(props => {
  props = mergeThemeProps(
    "Breadcrumb",
    {
      maxItem: 5,
      separator: "/",
      spacing: "0.5rem",
      itemsAfterCollapse: 1,
      itemsBeforeCollapse: 1,
    },
    props
  );

  const [local, list, styleConfigProps, others] = splitProps(
    props,
    ["class", "spacing", "children", "separator"],
    ["maxItem", "itemsAfterCollapse", "itemsBeforeCollapse"],
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
        <BreadcrumbList class={clsx(baseClasses().list)} gap={state.gap} {...list}>
          {local.children}
        </BreadcrumbList>
      </hope.nav>
    </BreadcrumbContext.Provider>
  );
});
