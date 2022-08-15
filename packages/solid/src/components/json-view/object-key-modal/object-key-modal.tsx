import { Component, createEffect, createSignal, onMount, Show } from "solid-js";

import Add from "../icons/add";
import CheckCircle from "../icons/check-circle";
import { attributeStore } from "../store/object-attributes";
import {
  keyModal,
  keyModalCancel,
  keyModalCancelIcon,
  keyModalInput,
  keyModalLabel,
  keyModalRequest,
  keyModalSubmit,
} from "../themes";

interface ObjectKeyModalProps {
  rjvId: string;
  input?: string;
  isValid: (input: string) => boolean;
  submit: (input: string) => void;
}

const ObjectKeyModal: Component<ObjectKeyModalProps> = props => {
  const [input, setInput] = createSignal("");
  const [valid, setValid] = createSignal(false);

  onMount(() => {
    setInput(() => (props.input ? props.input : ""));
    setValid(() => props.isValid(input()));
  });

  createEffect(() => {
    setValid(() => props.isValid(input()));
    console.log("key valid:", valid());
  });

  const closeModal = () => {
    console.log("closeModal");
    attributeStore.handleAction({
      rjvId: props.rjvId,
      name: "RESET",
    });
  };

  const submit = () => {
    props.submit(input());
  };

  return (
    <div
      class={`key-modal-request ${keyModalRequest()}`}
      onClick={closeModal}
      onKeyPress={e => {
        if (e.key == "escape") closeModal();
      }}
      role="button"
      tabindex="0"
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <div
        class={keyModal()}
        onClick={e => {
          if (!e.target.classList.contains("key-modal-cancel")) e.stopPropagation();
        }}
        role="button"
        tabindex="0"
      >
        <div class={keyModalLabel()}>Key Name:</div>
        <div style={{ position: "relative" }}>
          <input
            class={`key-modal-input ${keyModalInput()}`}
            ref={el => el && el.focus()}
            spellcheck={false}
            placeholder="..."
            oninput={e => setInput(e.currentTarget.value)}
            onKeyPress={e => {
              if (valid() && e.key === "Enter") {
                submit();
              } else if (e.key === "Escape") {
                closeModal();
              }
            }}
          />
          <Show when={valid()}>
            <CheckCircle class={`key-modal-submit ${keyModalSubmit()}`} onClick={() => submit()} />
          </Show>
        </div>
        <span class={keyModalCancel()}>
          <Add
            class={"key-modal-cancel " + keyModalCancelIcon()}
            onClick={() => {
              closeModal;
            }}
          />
        </span>
      </div>
    </div>
  );
};

export default ObjectKeyModal;
