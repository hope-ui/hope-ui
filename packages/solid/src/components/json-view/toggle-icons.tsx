import { Component, Match, Switch } from "solid-js";

import ArrowDown from "./icons/arrow-down";
import ArrowRight from "./icons/arrow-right";
import { collapsedIcon, expandedIcon } from "./themes";

export const ExpandedIcon: Component<{ iconStyle: string }> = props => {
  return (
    <Switch fallback={<ArrowDown class={`expanded-icon ${expandedIcon()}`} />}>
      <Match when={props.iconStyle === "triangle"}>
        <ArrowDown class={`expanded-icon ${expandedIcon()}`} />
      </Match>
    </Switch>
  );
};

export const CollapsedIcon: Component<{ iconStyle: string }> = props => {
  return (
    <Switch fallback={<ArrowRight class={`collapsed-icon ${collapsedIcon()}`} />}>
      <Match when={props.iconStyle === "triangle"}>
        <ArrowRight class={`collapsed-icon ${collapsedIcon()}`} />
      </Match>
    </Switch>
  );
};
