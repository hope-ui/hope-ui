import { Component, Show } from "solid-js";

import { attributeStore } from "../store/object-attributes";
import ObjectKeyModal from "./object-key-modal";

interface AddKeyRequestProps {
  defaultValue?: string | number | boolean | Array<any> | null;
  rjvId: string;
  active: boolean;
}

const AddKeyRequest: Component<AddKeyRequestProps> = props => {
  const isValid = (input: any) => {
    // const { rjvId } = props;
    const request = attributeStore.get(props.rjvId, "action", "new-key-request");
    return input != "" && Object.keys(request.existingValue).indexOf(input) === -1;
  };

  const submit = (input: any) => {
    const { rjvId } = props;
    const request = attributeStore.get(props.rjvId, "action", "new-key-request");
    request.newValue = { ...request.existingValue };
    request.newValue[input] = props.defaultValue;
    attributeStore.handleAction({
      name: "VARIABLE_ADDED",
      rjvId: rjvId,
      data: request,
    });
  };
  return (
    <Show when={props.active}>
      <ObjectKeyModal rjvId={props.rjvId} isValid={isValid} submit={submit} />
    </Show>
  );
};

export default AddKeyRequest;
