/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { css } from "@stitches/core";
import { Component, Show } from "solid-js";

import Add from "./icons/add";
import { attributeStore } from "./store/object-attributes";
import { validationFailure, validationFailureClear } from "./themes";

interface ValidationFailureProps {
  defaultValue?: string | number | boolean | Array<any> | null;
  rjvId: string;
  active: boolean;
  message?: string;
}
const ValidationFailure: Component<ValidationFailureProps> = props => {
  return (
    <Show when={props.active}>
      <div
        class={`validation-failure ${validationFailure()}`}
        onClick={() => {
          attributeStore.handleAction({
            rjvId: props.rjvId,
            name: "RESET",
          });
        }}
      >
        <span class={css({ marginRight: "6px" })()}>{props.message}</span>

        <Add class={validationFailureClear()} />
      </div>
    </Show>
  );
};
export default ValidationFailure;
