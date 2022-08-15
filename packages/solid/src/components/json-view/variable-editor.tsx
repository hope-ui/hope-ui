import { css } from "@stitches/core";
import { Component, Show } from "solid-js";
import { createStore } from "solid-js/store";

import { Textarea } from "../textarea";
import CopyToClipboard from "./copy-to-clipboard";
import {
  JsonBoolean,
  JsonDate,
  JsonFloat,
  JsonFunction,
  JsonInteger,
  JsonNan,
  JsonNull,
  JsonRegexp,
  JsonString,
  JsonUndefined,
} from "./data-types";
import parseInput from "./helpers/parse-input";
import stringifyVariable from "./helpers/stringify-variable";
import CheckCircle from "./icons/check-circle";
import Edit from "./icons/edit";
import Remove from "./icons/remove";
import { JsonViewProps } from "./json-view-props";
import { attributeStore } from "./store/object-attributes";
import {
  arrayKey,
  brace,
  colon,
  detectedRow,
  editInput,
  elipsis,
  objectKeyVal,
  objectName,
  variableValue,
  varIcon,
} from "./themes";

interface StateType {
  editMode: boolean;
  editValue: string | null;
  hovered: boolean;
  renameKey: boolean;
  parsedInput: {
    type: false | string;
    value: string | null;
  };
}

interface VariableEditorProps extends JsonViewProps {
  variable: any;
  namespace: Array<string | number>;
  editMode: boolean;
  singleIndent: number;
  rjvId: string;
}

const VariableEditor: Component<VariableEditorProps> = props => {
  const [state, setState] = createStore<StateType>({
    editMode: false,
    editValue: "",
    hovered: false,
    renameKey: false,
    parsedInput: {
      type: false,
      value: null,
    },
  });

  const prepopInput = (variable: any) => {
    if (props.onEdit) {
      const stringifiedValue = stringifyVariable(variable.value);
      const detected = parseInput(stringifiedValue);
      console.log("stringified:", stringifiedValue);
      console.log("stringified:", detected);
      setState({
        editMode: true,
        editValue: stringifiedValue,
        parsedInput: {
          type: detected.type,
          value: detected.value,
        },
      });
    }
  };

  const getEditIcon = () => {
    return (
      <div
        class="click-to-edit"
        style={{
          "vertical-align": "top",
          display: state.hovered ? "inline-block" : "none",
        }}
      >
        <Edit
          class={`click-to-edit-icon ${varIcon({ color: "edit" })}`}
          onClick={() => {
            prepopInput(props.variable);
          }}
        />
      </div>
    );
  };

  const getRemoveIcon = () => {
    return (
      <div
        class="click-to-remove"
        style={{
          "vertical-align": "top",
          display: state.hovered ? "inline-block" : "none",
        }}
      >
        <Remove
          class={`click-to-remove-icon ${varIcon({ color: "remove" })}`}
          onClick={() => {
            attributeStore.handleAction({
              name: "VARIABLE_REMOVED",
              rjvId: props.rjvId,
              data: {
                name: props.variable.name,
                namespace: props.namespace,
                existingValue: props.variable.value,
                variableRemoved: true,
                newValue: null,
              },
            });
          }}
        />
      </div>
    );
  };

  const submitEdit = (submitDetected = false) => {
    let newValue = state.editValue;
    if (submitDetected && state.parsedInput.type) {
      newValue = state.parsedInput.value;
    }
    setState(prev => ({
      ...prev,
      editMode: false,
    }));
    attributeStore.handleAction({
      name: "VARIABLE_UPDATED",
      rjvId: props.rjvId,
      data: {
        name: props.variable.name,
        namespace: props.namespace,
        existingValue: props.variable.value,
        newValue: newValue,
        variableRemoved: false,
      },
    });
  };

  const getDetectedInput = () => {
    const { type, value } = state.parsedInput;

    if (type !== false) {
      switch (type.toLowerCase()) {
        case "object":
          return (
            <span>
              <span class={brace({ css: { cursor: "default" } })}>{"{"}</span>
              <span class={elipsis({ css: { cursor: "default" } })}>...</span>
              <span class={brace({ css: { cursor: "default" } })}>{"}"}</span>
            </span>
          );
        case "array":
          return (
            <span>
              <span class={brace({ css: { cursor: "default" } })}>{"["}</span>
              <span class={elipsis({ css: { cursor: "default" } })}>...</span>
              <span class={brace({ css: { cursor: "default" } })}>{"]"}</span>
            </span>
          );
        case "string":
          return <JsonString value={value || ""} {...props} />;
        case "integer":
          return <JsonInteger value={parseInt(value || "")} {...props} />;
        case "float":
          return <JsonFloat value={parseFloat(value || "")} {...props} />;
        case "boolean":
          return <JsonBoolean value={value ? true : false} {...props} />;
        case "function":
          return <JsonFunction value={value} {...props} />;
        case "null":
          return <JsonNull {...props} />;
        case "nan":
          return <JsonNan {...props} />;
        case "undefined":
          return <JsonUndefined {...props} />;
        case "date":
          return <JsonDate value={new Date(value || "")} {...props} />;
      }
    }
  };

  const showDetected = () => {
    const detected = getDetectedInput();
    if (detected) {
      return (
        <div>
          <div class={detectedRow()}>
            {detected}
            <CheckCircle
              class={
                "edit-check detected " +
                varIcon({ color: "check", css: { verticalAlign: "top", paddingLeft: "3px" } })
              }
              onClick={() => {
                submitEdit(true);
              }}
            />
          </div>
        </div>
      );
    }
  };

  const getEditInput = () => {
    return (
      <div>
        <Textarea
          ref={(input: any) => input && input.focus()}
          value={state.editValue || undefined}
          class={`variable-editor ${editInput(css({ width: "90%" }))}`}
          onInput={event => {
            const value = event.currentTarget.value;
            const detected = parseInput(value);
            setState({
              editValue: value,
              parsedInput: {
                type: detected.type,
                value: detected.value,
              },
            });
          }}
          onKeyDown={e => {
            switch (e.key) {
              case "Escape": {
                setState({
                  editMode: false,
                  editValue: "",
                });
                break;
              }
              case "Enter": {
                if (e.ctrlKey || e.metaKey) {
                  submitEdit(true);
                }
                break;
              }
            }
            e.stopPropagation();
          }}
          placeholder="update this value"
          rows={2}
          resize="vertical"
        />
        <div class={css({ display: "inline-block", verticalAlign: "top" })()}>
          <Remove
            class={`edit-cancel ${varIcon({ color: "cancel" })}`}
            onClick={() => {
              setState(prev => ({ ...prev, editMode: false, editValue: "" }));
            }}
          />
          <CheckCircle
            class={"edit-check string-value " + varIcon({ color: "check" })}
            onClick={() => {
              submitEdit();
            }}
          />
          <div>{showDetected()}</div>
        </div>
      </div>
    );
  };

  const getValue = (variable: any, editMode: boolean) => {
    const type = editMode ? false : variable.type;

    switch (type) {
      case false:
        return getEditInput();
      case "string":
        return <JsonString value={variable.value} {...props} />;
      case "integer":
        return <JsonInteger value={variable.value} {...props} />;
      case "float":
        return <JsonFloat value={variable.value} {...props} />;
      case "boolean":
        return <JsonBoolean value={variable.value} {...props} />;
      case "function":
        return <JsonFunction value={variable.value} {...props} />;
      case "null":
        return <JsonNull {...props} />;
      case "nan":
        return <JsonNan {...props} />;
      case "undefined":
        return <JsonUndefined {...props} />;
      case "date":
        return <JsonDate value={variable.value} {...props} />;
      case "regexp":
        return <JsonRegexp value={variable.value} {...props} />;
      default:
        // catch-all for types that weren't anticipated
        return <div class="object-value">{JSON.stringify(variable.value)}</div>;
    }
  };

  const handleClick = (e: MouseEvent | KeyboardEvent) => {
    if (!props.onSelect && !props.onEdit) return;

    const location = [...props.namespace];
    if ((e.ctrlKey || e.metaKey) && props.onEdit) {
      prepopInput(props.variable);
    } else if (typeof props.onSelect === "function") {
      location.shift();
      props.onSelect({
        ...props.variable,
        namespace: location,
      });
    }
  };

  return (
    <div
      class={`variable-row ${
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        objectKeyVal({ css: { paddingLeft: props.indentWidth! * props.singleIndent } })
      }`}
      onMouseEnter={() => setState(prev => ({ ...prev, hovered: true }))}
      onMouseLeave={() => setState(prev => ({ ...prev, hovered: false }))}
      id={props.variable.name}
    >
      {props.type == "array" ? (
        props.displayArrayKey ? (
          <span class={arrayKey()} id={props.variable.name + "_" + props.namespace}>
            {props.variable.name}
            <div class={colon()}>:</div>
          </span>
        ) : null
      ) : (
        <span>
          <span
            class={"object-key " + objectName()}
            id={props.variable.name + "_" + props.namespace}
          >
            {!!props.quotesOnKeys && <span style={{ "vertical-align": "top" }}>"</span>}
            <span style={{ display: "inline-block" }}>{props.variable.name}</span>
            {!!props.quotesOnKeys && <span style={{ "vertical-align": "top" }}>"</span>}
          </span>
          <span class={colon()}>:</span>
        </span>
      )}
      <div
        class={
          "variable-value " +
          variableValue({ css: { cursor: !props.onSelect ? "default" : "pointer" } })
        }
        onClick={handleClick}
        onKeyPress={handleClick}
        role="button"
        tabindex="0"
      >
        {getValue(props.variable, state.editMode)}
      </div>
      <Show when={props.enableClipboard}>
        <CopyToClipboard
          rowHovered={state.hovered}
          hidden={state.editMode}
          src={props.variable.value}
          clickCallback={e => console.log(e, "copied")}
          namespace={[...props.namespace, props.variable.name]}
        />
      </Show>

      {props.onEdit && state.editMode == false ? getEditIcon() : null}
      {props.onDelete && state.editMode == false ? getRemoveIcon() : null}
    </div>
  );
};

export default VariableEditor;
