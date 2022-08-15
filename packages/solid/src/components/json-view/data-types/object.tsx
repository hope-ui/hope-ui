import { css } from "@stitches/core";
import { Component, createSignal, onMount, Show, splitProps } from "solid-js";
import { createStore } from "solid-js/store";

import ArrayGroup from "../array-group";
import { toType } from "../helpers/util";
import { JsonViewProps } from "../json-view-props";
import ObjectName from "../object-name";
import { brace, braceRow, elipsis, iconContainer, objectKeyVal, pushedContent } from "../themes";
import { CollapsedIcon, ExpandedIcon } from "../toggle-icons";
import VariableEditor from "../variable-editor";
import VariableMeta from "../variable-meta";

interface ObjectProps extends JsonViewProps {
  depth?: number;
  namespace: Array<string | number>;
  key?: string | number;
  parentType?: "array" | "array_group" | "object";
  indexOffset?: number;
  jsvRoot?: boolean;
  rjvId: string;
  type: string;
  name: string;
}

//increment 1 with each nested object & array
const DEPTH_INCREMENT = 1;
//single indent is 5px
const SINGLE_INDENT = 5;

// eslint-disable-next-line solid/no-destructure
const JsonObject: Component<ObjectProps> = ({ name, ...props }) => {
  const getState = () => {
    const size = Object.keys(props.src).length;

    const expanded =
      props.collapsed != undefined &&
      (props.collapsed === false ||
        (props.collapsed !== true && props.collapsed > (props.depth || 0))) &&
      (!props.shouldCollapse ||
        props.shouldCollapse({
          name: name,
          src: props.src,
          type: toType(props.src),
          namespace: props.namespace,
        }) === false) &&
      // initialize closed if object has no items
      size !== 0;
    const state = {
      expanded: expanded, //attributeStore.get(props.rjvId, props.namespace, "expanded", expanded),
      objectType: props.type === "array" ? "array" : "object",
      parentType: props.type === "array" ? "array" : "object",
      size,
      hovered: false,
    };
    return state;
  };

  const [state, setState] = createStore({ ...getState() });
  const [localProps, childProps] = splitProps(props, [
    "depth",
    "src",
    "namespace",
    "type",
    "parentType",
    "theme",
    "jsvRoot",
    "iconStyle",
    "indentWidth",
  ]);

  const [styles, setStyles] = createSignal({});

  onMount(() => {
    if (!localProps.jsvRoot && localProps.parentType !== "array_group") {
      setStyles(() => ({ paddingLeft: localProps.indentWidth || 0 * SINGLE_INDENT }));
    } else if (localProps.parentType === "array_group") {
      setStyles(() => ({ borderLeft: 0, display: "inline" }));
    }
  });

  return (
    <div
      class={`object-key-val ${localProps.jsvRoot != true ? objectKeyVal() : "jsv-root"} ${css(
        styles()
      )}`}
      onMouseEnter={() => setState({ hovered: true })}
      onMouseLeave={() => setState({ hovered: false })}
    >
      {getBraceStart(state.objectType, state.expanded)}
      <Show when={state.expanded} fallback={getEllipsis()}>
        {getObjectContent(localProps.src, {
          theme: localProps.theme,
          iconStyle: localProps.iconStyle,
          indentWidth: localProps.indentWidth,
          ...childProps,
        })}
      </Show>
      <span class="brace-row">
        <span class={brace({ css: { paddingLeft: state.expanded ? "3px" : "0px" } })}>
          {state.objectType === "array" ? "]" : "}"}
        </span>
        <Show when={!state.expanded}>{getObjectMetaData(props.src)}</Show>
      </span>
    </div>
  );

  function renderObjectContents(variables: any, childProps: any) {
    const elements: any = [];
    let variable: JsonVariable;
    let keys = Object.keys(variables || {});
    if (props.sortKeys && state.objectType !== "array") {
      keys = keys.sort();
    }

    keys.forEach(name => {
      variable = new JsonVariable(name, variables[name]);

      if (props.parentType === "array_group" && props.indexOffset) {
        variable.name = parseInt(variable.name + "") + props.indexOffset;
      }

      if (!(name in variables)) {
        return;
      } else if (variable.type === "object") {
        elements.push(
          <JsonObject
            key={variable.name}
            depth={props.depth || 0 + DEPTH_INCREMENT}
            name={variable.name}
            src={variable.value}
            namespace={props.namespace.concat(variable.name)}
            parentType={state.objectType}
            {...childProps}
          />
        );
      } else if (variable.type === "array") {
        let ObjectComponent = JsonObject;

        if (props.groupArraysAfterLength && variable.value.length > props.groupArraysAfterLength) {
          ObjectComponent = ArrayGroup;
        }
        elements.push(
          <ObjectComponent
            depth={props.depth || 0 + DEPTH_INCREMENT}
            name={variable.name}
            src={variable.value}
            namespace={props.namespace.concat(variable.name)}
            type="array"
            parentType={state.objectType}
            {...childProps}
          />
        );
      } else {
        elements.push(
          <VariableEditor
            // key={variable.name + "_" + props.namespace}
            variable={variable}
            singleIndent={SINGLE_INDENT}
            namespace={props.namespace}
            type={props.type}
            {...childProps}
          />
        );
      }
    });

    return elements;
  }

  function getObjectContent(src: any, childProps: any) {
    return (
      <div class="pushed-content object-container">
        <div class={`object-content ${pushedContent()}`}>
          {renderObjectContents(src, childProps)}
        </div>
      </div>
    );
  }

  function toggleCollapsed() {
    setState(prev => {
      const expanded = !prev.expanded;

      //attributeStore.set(props.rjvId, props.namespace, "expanded", expanded);
      return {
        ...prev,
        expanded: expanded,
      };
    });
  }
  function getEllipsis() {
    if (state.size === 0) {
      //don't render an ellipsis when an object has no items
      return null;
    } else {
      return (
        <span
          class={`node-ellipsis ${elipsis()}`}
          onClick={toggleCollapsed}
          onKeyPress={e => {
            if (e.key == "space") toggleCollapsed();
          }}
          role="button"
          tabIndex="0"
        >
          ...
        </span>
      );
    }
  }

  function getObjectMetaData(src: object) {
    return (
      <VariableMeta rowHovered={state.hovered} size={state.size} {...props} name={name} src={src} />
    );
  }

  function getBraceStart(objectType: any, expanded: boolean) {
    if (props.parentType === "array_group") {
      return (
        <span>
          <span class={brace()}>{objectType === "array" ? "[" : "{"}</span>
          {expanded ? getObjectMetaData(props.src) : null}
        </span>
      );
    }

    const IconComponent = expanded ? ExpandedIcon : CollapsedIcon;

    return (
      <span>
        <span
          onClick={() => {
            toggleCollapsed();
          }}
          onKeyPress={e => {
            if (e.key == "space") toggleCollapsed();
          }}
          role="button"
          tabIndex="0"
          class={braceRow()}
        >
          <div class={`icon-container ${iconContainer()}`}>
            <IconComponent iconStyle={props.iconStyle || "triangle"} />
          </div>
          <ObjectName name={name} {...localProps} />
          <span class={brace()}>{objectType === "array" ? "[" : "{"}</span>
        </span>
        {expanded ? getObjectMetaData(props.src) : null}
      </span>
    );
  }
};

class JsonVariable {
  name: string | number;
  value: any;
  type: string | null;

  constructor(name: string | number, value: any) {
    this.name = name;
    this.value = value;
    this.type = toType(value);
  }
}

export default JsonObject;
