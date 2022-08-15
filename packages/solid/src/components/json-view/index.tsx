import { Component, mergeProps, onCleanup, onMount, splitProps } from "solid-js";
import { createStore } from "solid-js/store";

import { isTheme, toType } from "./helpers/util";
import { JsonViewProps } from "./json-view-props";
import JsonViewer from "./json-viewer";
import AddKeyRequest from "./object-key-modal/add-key-request";
import { attributeStore } from "./store/object-attributes";
import { appContainer, setTheme } from "./themes";
import ValidationFailure from "./validation-failure";

const defaultProps: JsonViewProps = {
  src: {},
  name: "root",
  theme: "default",
  collapsed: false,
  collapseStringsAfterLength: 10,
  shouldCollapse: () => false,
  sortKeys: false,
  quotesOnKeys: true,
  groupArraysAfterLength: 100,
  indentWidth: 4,
  enableClipboard: true,
  displayObjectSize: true,
  displayDataTypes: true,
  onEdit: false,
  onDelete: false,
  onAdd: false,
  onSelect: false,
  iconStyle: "triangle",
  style: {},
  validationMessage: "Validation Error",
  defaultValue: null,
  displayArrayKey: true,
};

// eslint-disable-next-line solid/no-destructure
export const SolidJsonView: Component<JsonViewProps> = props => {
  const mergedProps = mergeProps(defaultProps, props);

  // console.log(mergedProps);
  const [state, setState] = createStore<any>({});

  //reference id for this instance
  const rjvId = Date.now().toString();

  const getListeners = () => {
    return {
      reset: resetState,
      "variable-update": updateSrc,
      "add-key-request": addKeyRequest,
    };
  };

  onMount(() => {
    //   // initialize
    attributeStore.set(rjvId, "global", "src", props.src);
    // bind to events
    const listeners = getListeners();
    for (const i in listeners) {
      const index: keyof typeof listeners = i as any;
      attributeStore.on(i + "-" + rjvId, listeners[index]);
    }
    //reset key request to false once it's observed
    setState({
      src: props.src,
      //listen to request to add/edit a key to an object
      addKeyRequest: false,
      editKeyRequest: false,
      validationFailure: validateState(props.src),
    });
  });

  onCleanup(() => {
    const listeners = getListeners();
    for (const i in listeners) {
      const index: keyof typeof listeners = i as any;
      attributeStore.removeListener(i + "-" + rjvId, listeners[index]);
    }
  });

  //make sure mergedProps are passed in as expected
  const validateState = (src: any) => {
    //make sure theme is valid
    if (toType(mergedProps.theme) === "object" && !isTheme(mergedProps.theme)) {
      console.error(
        "json-view error:",
        "theme prop must be a theme name or valid base-16 theme object.",
        'defaulting to "default" theme'
      );
    }
    //make sure `src` prop is valid
    if (toType(src) !== "object" && toType(src) !== "array") {
      console.error("react-json-view error:", "src property must be a valid json object");
      return true;
    }
    return false;
  };

  const updateSrc = () => {
    const { name, namespace, newValue, existingValue, updatedSrc, type } = attributeStore.get(
      rjvId,
      "action",
      "variable-update"
    );

    let result;

    const onEditPayload = {
      existingSrc: state.src,
      newValue: newValue,
      updatedSrc: updatedSrc,
      name: name,
      namespace: namespace,
      existingValue: existingValue,
    };

    switch (type) {
      case "variable-added":
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result =
          typeof mergedProps.onAdd === "function"
            ? mergedProps.onAdd(onEditPayload)
            : mergedProps.onAdd;
        break;
      case "variable-edited":
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result =
          typeof mergedProps.onEdit === "function"
            ? mergedProps.onEdit(onEditPayload)
            : mergedProps.onEdit;
        break;
      case "variable-removed":
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        result =
          typeof mergedProps.onDelete === "function"
            ? mergedProps.onDelete(onEditPayload)
            : mergedProps.onDelete;

        break;
    }

    if (result !== false) {
      attributeStore.set(rjvId, "global", "src", updatedSrc);
      setState({
        src: updatedSrc,
      });
    } else {
      setState({
        validationFailure: true,
      });
    }
  };

  const addKeyRequest = () => {
    setState({
      addKeyRequest: true,
    });
  };

  const resetState = () => {
    console.log("reset state");
    setState({
      validationFailure: false,
      addKeyRequest: false,
    });
  };

  const [localProps, childProps] = splitProps(mergedProps, [
    "name",
    "theme",
    "defaultValue",
    "style",
    "validationMessage",
  ]);
  return (
    <div
      class={`solid-json-view ${appContainer({
        css: { ...localProps.style },
      })} ${setTheme(localProps.theme)}`}
    >
      <ValidationFailure
        message={localProps.validationMessage}
        active={state.validationFailure}
        rjvId={rjvId}
      />
      <JsonViewer
        {...childProps}
        src={state.src}
        name={localProps.name || "root"}
        type={toType(state.src)}
        rjvId={rjvId}
      />
      <AddKeyRequest
        active={state.addKeyRequest}
        rjvId={rjvId}
        defaultValue={localProps.defaultValue}
      />
    </div>
  );
};
