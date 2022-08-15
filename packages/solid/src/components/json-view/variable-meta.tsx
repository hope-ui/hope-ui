/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Component, Show } from "solid-js";

import CopyToClipboard from "./copy-to-clipboard";
import { toType } from "./helpers/util";
import Add from "./icons/add";
import Remove from "./icons/remove";
import { JsonViewProps } from "./json-view-props";
import { attributeStore } from "./store/object-attributes";
import { metaData, objectSize, varIcon } from "./themes";

interface MetaProps extends JsonViewProps {
  name: string;
  namespace: Array<string | number>;
  size: number;
  depth?: number;
  rowHovered?: boolean;
  rjvId: string;
}

const VariableMeta: Component<MetaProps> = props => {
  const getObjectSize = () => {
    if (props.displayObjectSize) {
      return (
        <span class={`object-size ${objectSize()}`}>
          {props.size} item{props.size === 1 ? "" : "s"}
        </span>
      );
    }
  };

  const getAddAttribute = (rowHovered: boolean) => {
    return (
      <span
        class="click-to-add"
        style={{
          "vertical-align": "top",
          display: rowHovered ? "inline-block" : "none",
        }}
      >
        <Add
          class={`click-to-add-icon ${varIcon({ color: "add" })}`}
          onClick={() => {
            const request = {
              name: props.depth && props.depth > 0 ? props.name : null,
              namespace: props.namespace.splice(0, props.namespace.length - 1),
              existingValue: props.src,
              variableRemoved: false,
              keyName: null,
              newValue: null,
            };
            if (toType(props.src) === "object") {
              attributeStore.handleAction({
                name: "ADD_VARIABLE_KEY_REQUEST",
                rjvId: props.rjvId,
                data: request,
              });
            } else {
              attributeStore.handleAction({
                name: "VARIABLE_ADDED",
                rjvId: props.rjvId,
                data: {
                  ...request,
                  newValue: [...props.src, null],
                },
              });
            }
          }}
        />
      </span>
    );
  };

  const getRemoveObject = (rowHovered: boolean) => {
    //don't allow deleting of root node
    if (props.namespace.length === 1) {
      return;
    }
    return (
      <span
        class="click-to-remove"
        style={{
          display: rowHovered ? "inline-block" : "none",
        }}
      >
        <Remove
          class={`click-to-remove-icon ${varIcon({ color: "remove" })}`}
          onClick={() => {
            attributeStore.handleAction({
              name: "VARIABLE_REMOVED",
              rjvId: props.rjvId,
              data: {
                name: props.name,
                namespace: props.namespace.splice(0, props.namespace.length - 1),
                existingValue: props.src,
                variableRemoved: true,
                newValue: null,
              },
            });
          }}
        />
      </span>
    );
  };
  return (
    <div
      class={`object-meta-data ${metaData({ dataType: "object" })}`}
      onClick={e => {
        e.stopPropagation();
      }}
    >
      {/* size badge display */}
      {getObjectSize()}
      <Show when={props.enableClipboard}>
        <CopyToClipboard
          rowHovered={props.rowHovered || false}
          hidden={false}
          src={props.src}
          clickCallback={e => console.log(e, "copied")}
          namespace={props.namespace}
        />
      </Show>
      {props.onAdd ? getAddAttribute(props.rowHovered || false) : null}
      {props.onDelete ? getRemoveObject(props.rowHovered || false) : null}
    </div>
  );
};

export default VariableMeta;
