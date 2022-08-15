/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { css } from "@stitches/core";
import { Component, createSignal, For, Show, splitProps } from "solid-js";

import { JsonObject } from "./data-types";
import { JsonViewProps } from "./json-view-props";
import ObjectName from "./object-name";
import { brace, braceRow, iconContainer, metaData, objectKeyVal, objectSize } from "./themes";
import { CollapsedIcon, ExpandedIcon } from "./toggle-icons";
import VariableMeta from "./variable-meta";

interface ArrayGroupProps extends JsonViewProps {
  depth?: number;
  namespace: Array<string | number>;
  key?: string | number;
  parentType?: "array" | "array_group" | "object";
  indexOffset?: number;
  jsvRoot?: boolean;
  rjvId: string;
  name: string;
  type: string;
}
//single indent is 5px
const SINGLE_INDENT = 5;
const ArrayGroup: Component<ArrayGroupProps> = props => {
  const [expanded, setExpanded] = createSignal<Array<any>>([]);

  const toggleCollapsed = (i: number) => {
    const newExpanded = [...expanded()];

    newExpanded[i] = !newExpanded[i];
    setExpanded(newExpanded);
  };

  const getExpandedIcon = (i: number) => {
    if (expanded()[i]) return <ExpandedIcon iconStyle={props.iconStyle || "triangle"} />;

    return <CollapsedIcon iconStyle={props.iconStyle || "triangle"} />;
  };
  const [localProps, childProps] = splitProps(props, [
    "namespace",
    "name",
    "iconStyle",
    "indentWidth",
    "src",
    "jsvRoot",
    "groupArraysAfterLength",
  ]);

  return (
    <div
      class={`object-key-val ${localProps.jsvRoot != true ? objectKeyVal() : "jsv-root"} ${css({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        paddingLeft: localProps.indentWidth! * SINGLE_INDENT,
      })}`}
    >
      <ObjectName {...props} />
      <span>
        <VariableMeta size={localProps.src.length} {...props} />
      </span>
      <For each={[...Array(Math.ceil(localProps.src.length / localProps.groupArraysAfterLength!))]}>
        {(_, index) => (
          <div
            class={`object-key-val array-group ${objectKeyVal({
              css: { marginLeft: 6, paddingLeft: localProps.indentWidth! * SINGLE_INDENT },
            })}`}
          >
            <span class={braceRow()}>
              <div
                class={`icon-container ${iconContainer()}`}
                onClick={() => {
                  toggleCollapsed(index());
                }}
                onKeyPress={e => {
                  if (e.key == "space") toggleCollapsed(index());
                }}
                role="button"
                tabIndex="0"
              >
                {getExpandedIcon(index())}
              </div>
              <Show when={expanded()[index()]}>
                <JsonObject
                  key={localProps.name + index()}
                  depth={0}
                  name={localProps.name}
                  collapsed={false}
                  groupArraysAfterLength={localProps.groupArraysAfterLength}
                  indexOffset={index() * localProps.groupArraysAfterLength!}
                  src={localProps.src.slice(
                    index() * localProps.groupArraysAfterLength!,
                    index() * localProps.groupArraysAfterLength! +
                      localProps.groupArraysAfterLength!
                  )}
                  namespace={localProps.namespace}
                  parentType="array_group"
                  theme={props.theme}
                  {...childProps}
                  type="array"
                />
              </Show>{" "}
              ? ( ) : (
              <span
                onClick={() => {
                  toggleCollapsed(index());
                }}
                onKeyPress={e => {
                  if (e.key == "space") toggleCollapsed(index());
                }}
                class={`array-group-brace ${brace()}`}
                role="button"
                tabindex="0"
              >
                [
                <div class={`array-group-meta-data ${metaData({ dataType: "arrayGroup" })}`}>
                  <span class={`object-size ${objectSize()}`}>
                    {index() * localProps.groupArraysAfterLength!}
                    {" - "}
                    {index() * localProps.groupArraysAfterLength! +
                      localProps.groupArraysAfterLength! >
                    localProps.src.length
                      ? localProps.src.length
                      : index() * localProps.groupArraysAfterLength! +
                        localProps.groupArraysAfterLength!}
                  </span>
                </div>
                ]
              </span>
              )
            </span>
          </div>
        )}
      </For>
    </div>
  );
};

export default ArrayGroup;
