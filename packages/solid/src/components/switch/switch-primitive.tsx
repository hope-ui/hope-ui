import {
  Accessor,
  createContext,
  createUniqueId,
  JSX,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";

import { visuallyHiddenStyles } from "../../styled-system/utils";
import { isFunction } from "../../utils";
import { classNames } from "../../utils/css";
import { callHandler } from "../../utils/function";
import { hope } from "../factory";
import { useFormControl } from "../form-control/use-form-control";
import { ElementType, HTMLHopeProps } from "../types";

type SwitchPrimitiveChildrenRenderProp = (props: {
  state: Accessor<SwitchPrimitiveState>;
}) => JSX.Element;

interface SwitchPrimitiveOptions {
  /**
   * The ref to be passed to the internal <input> tag.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);

  /**
   * The id to be passed to the internal <input> tag.
   */
  id?: string;

  /**
   * The css class to be passed to the internal <input> tag.
   */
  inputClass?: string;

  /**
   * The name to be passed to the internal <input> tag.
   */
  name?: string;

  /**
   * The value to be used in the switch input.
   * This is the value that will be returned on form submission.
   */
  value?: string | number;

  /**
   * If `true`, the switch will be checked.
   * You'll need to pass `onChange` to update its value (since it is now controlled)
   */
  checked?: boolean;

  /**
   * If `true`, the switch will be initially checked.
   */
  defaultChecked?: boolean;

  /**
   * If `true`, the switch input is marked as required,
   * and `required` attribute will be added
   */
  required?: boolean;

  /**
   * If `true`, the switch will be disabled
   */
  disabled?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * If `true`, the switch will be readonly
   */
  readOnly?: boolean;

  /**
   * The children of the switch.
   */
  children?: JSX.Element | SwitchPrimitiveChildrenRenderProp;

  /**
   * The callback invoked when the checked state of the switch changes.
   */
  onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;

  /**
   * The callback invoked when the switch is focused
   */
  onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;

  /**
   * The callback invoked when the switch is blurred (loses focus)
   */
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

export type SwitchPrimitiveProps<C extends ElementType = "label"> = HTMLHopeProps<
  C,
  SwitchPrimitiveOptions
>;

interface SwitchPrimitiveState {
  /**
   * The `checked` state of the switch.
   * (In uncontrolled mode)
   */
  _checked: boolean;

  /**
   * If `true`, the switch is in controlled mode.
   * (have checked and onChange props)
   */
  isControlled: boolean;

  /**
   * If `true`, the switch is currently focused.
   */
  isFocused: boolean;

  /**
   * The `checked` state of the switch.
   * (In controlled mode)
   */
  checked: boolean;

  /**
   * The value to be used in the switch input.
   * This is the value that will be returned on form submission.
   */
  value?: string | number;

  /**
   * The id of the input field in a switch.
   */
  id?: string;

  /**
   * The name of the input field in a switch.
   */
  name?: string;

  /**
   * If `true`, the switch input is marked as required,
   * and `required` attribute will be added
   */
  required?: boolean;

  /**
   * If `true`, the switch will be disabled
   */
  disabled?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * If `true`, the switch will be readonly
   */
  readOnly?: boolean;

  "aria-required"?: boolean;
  "aria-disabled"?: boolean;
  "aria-invalid"?: boolean;
  "aria-readonly"?: boolean;

  "data-focus"?: string;
  "data-checked"?: string;
  "data-required"?: string;
  "data-disabled"?: string;
  "data-invalid"?: string;
  "data-readonly"?: string;
}

/**
 * Contains all the parts of a switch.
 * It renders a `label` with a visualy hidden `input[type=checkbox][role=switch]`.
 * You can style this element directly, or you can use it as a wrapper to put other components into, or both.
 */
export function SwitchPrimitive<C extends ElementType = "label">(props: SwitchPrimitiveProps<C>) {
  const defaultId = `hope-switch-${createUniqueId()}`;

  const formControlProps = useFormControl<HTMLInputElement>(props);

  const [state, setState] = createStore<SwitchPrimitiveState>({
    // eslint-disable-next-line solid/reactivity
    _checked: !!props.defaultChecked,
    isFocused: false,
    get isControlled() {
      return props.checked !== undefined;
    },
    get checked() {
      return this.isControlled ? !!props.checked : this._checked;
    },
    get id() {
      return formControlProps.id ?? defaultId;
    },
    get name() {
      return props.name;
    },
    get value() {
      return props.value;
    },
    get required() {
      return formControlProps.required;
    },
    get disabled() {
      return formControlProps.disabled;
    },
    get invalid() {
      return formControlProps.invalid;
    },
    get readOnly() {
      return formControlProps.readOnly;
    },
    get ["aria-required"]() {
      return this.required ? true : undefined;
    },
    get ["aria-disabled"]() {
      return this.disabled ? true : undefined;
    },
    get ["aria-invalid"]() {
      return this.invalid ? true : undefined;
    },
    get ["aria-readonly"]() {
      return this.readOnly ? true : undefined;
    },
    get ["data-focus"]() {
      return this.isFocused ? "" : undefined;
    },
    get ["data-checked"]() {
      return this.checked ? "" : undefined;
    },
    get ["data-required"]() {
      return this.required ? "" : undefined;
    },
    get ["data-disabled"]() {
      return this.disabled ? "" : undefined;
    },
    get ["data-invalid"]() {
      return this.invalid ? "" : undefined;
    },
    get ["data-readonly"]() {
      return this.readOnly ? "" : undefined;
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    props as SwitchPrimitiveProps<"label">,
    [
      "inputClass",
      "children",
      "ref",
      "tabIndex",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "onChange",
    ],
    [
      "id",
      "name",
      "value",
      "checked",
      "defaultChecked",
      "required",
      "disabled",
      "invalid",
      "readOnly",
      "onFocus",
      "onBlur",
    ]
  );

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (state.readOnly || state.disabled) {
      event.preventDefault();
      return;
    }

    if (!state.isControlled) {
      const target = event.target as HTMLInputElement;
      setState("_checked", target.checked);
    }

    callHandler(local.onChange, event);
  };

  const onFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", true);
    callHandler(formControlProps.onFocus, event);
  };

  const onBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", false);
    callHandler(formControlProps.onBlur, event);
  };

  const inputClasses = () => classNames(local.inputClass, visuallyHiddenStyles());

  const stateAccessor = () => state;

  const context: SwitchPrimitiveContextValue = {
    state,
  };

  return (
    <SwitchPrimitiveContext.Provider value={context}>
      <hope.label
        for={state.id}
        data-group
        data-focus={state["data-focus"]}
        data-checked={state["data-checked"]}
        data-required={state["data-required"]}
        data-disabled={state["data-disabled"]}
        data-invalid={state["data-invalid"]}
        data-readonly={state["data-readonly"]}
        {...others}
      >
        <input
          type="checkbox"
          role="switch"
          class={inputClasses()}
          ref={local.ref}
          tabIndex={local.tabIndex}
          value={state.value}
          id={state.id}
          name={state.name}
          checked={state.checked}
          required={state.required}
          disabled={state.disabled}
          readOnly={state.readOnly}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-required={state["aria-required"]}
          aria-disabled={state["aria-disabled"]}
          aria-invalid={state["aria-invalid"]}
          aria-readonly={state["aria-readonly"]}
          aria-label={local["aria-label"]}
          aria-labelledby={local["aria-labelledby"]}
          aria-describedby={local["aria-describedby"]}
        />
        <Show when={isFunction(local.children)} fallback={local.children as JSX.Element}>
          {(local.children as SwitchPrimitiveChildrenRenderProp)?.({ state: stateAccessor })}
        </Show>
      </hope.label>
    </SwitchPrimitiveContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface SwitchPrimitiveContextValue {
  state: SwitchPrimitiveState;
}

const SwitchPrimitiveContext = createContext<SwitchPrimitiveContextValue>();

export function useSwitchPrimitivehContext() {
  const context = useContext(SwitchPrimitiveContext);

  if (!context) {
    throw new Error(
      "[Hope UI]: useSwitchPrimitivehContext must be used within a `<SwitchPrimitive />` component"
    );
  }

  return context;
}
