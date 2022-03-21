import { createContext, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useComponentStyleConfigs } from "@/theme/provider";

import { ThemeableCheckboxOptions } from "./checkbox";

type CheckboxGroupValue = (string | number)[];

interface CheckboxGroupProps extends ThemeableCheckboxOptions {
  /**
   * The `name` attribute forwarded to each `checkbox` element
   */
  name?: string;

  /**
   * The value of the checkbox group.
   * (in controlled mode)
   */
  value?: CheckboxGroupValue;

  /**
   * The initial value of the checkbox group.
   * (in uncontrolled mode)
   */
  defaultValue?: CheckboxGroupValue;

  /**
   * If `true`, all wrapped checkbox inputs will be marked as required,
   * and `required` attribute will be added.
   */
  required?: boolean;

  /**
   * If `true`, all wrapped checkbox inputs will be disabled.
   */
  disabled?: boolean;

  /**
   * If `true`, all wrapped checkbox inputs will have `aria-invalid` set to `true`.
   */
  invalid?: boolean;

  /**
   * If `true`, all wrapped checkbox inputs will be readonly.
   */
  readOnly?: boolean;

  /**
   * The children of the CheckboxGroup.
   */
  children?: JSX.Element;

  /**
   * Callback invoked once a checkbox is checked.
   * @param value the value of the checked checkbox
   */
  onChange?: (value: CheckboxGroupValue) => void;
}

type CheckboxGroupState = Omit<CheckboxGroupProps, "name" | "onChange"> & {
  valueState: CheckboxGroupValue;
  isControlled: boolean;
  name: string;
};

interface CheckboxGroupContextValue {
  state: CheckboxGroupState;

  /**
   * The callback invoked when the checked state of the `Checkbox` in `CheckboxGroup` changes.
   */
  onChange: JSX.EventHandlerUnion<HTMLInputElement, Event>;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue>();

export function CheckboxGroup(props: CheckboxGroupProps) {
  const theme = useComponentStyleConfigs().Checkbox;

  const defaultName = `hope-checkbox-group-${createUniqueId()}`;

  const [state, setState] = createStore<CheckboxGroupState>({
    // Internal state for uncontrolled checkbox-group.
    // eslint-disable-next-line solid/reactivity
    valueState: props.defaultValue ?? [],
    get isControlled() {
      return props.value !== undefined;
    },
    get value() {
      return this.isControlled ? props.value : this.valueState;
    },
    get name() {
      return props.name ?? defaultName;
    },
    get required() {
      return props.required;
    },
    get disabled() {
      return props.disabled;
    },
    get invalid() {
      return props.invalid;
    },
    get readOnly() {
      return props.readOnly;
    },
    get variant() {
      return props.variant ?? theme?.defaultProps?.group?.variant;
    },
    get colorScheme() {
      return props.colorScheme ?? theme?.defaultProps?.group?.colorScheme;
    },
    get size() {
      return props.size ?? theme?.defaultProps?.group?.size;
    },
    get labelPlacement() {
      return props.labelPlacement ?? theme?.defaultProps?.group?.labelPlacement;
    },
  });

  const [local, others] = splitProps(props, ["children", "value", "defaultValue", "name", "disabled", "onChange"]);

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (!state.value) {
      return;
    }

    const target = event.target as HTMLInputElement;

    const nextValue: CheckboxGroupValue = target.checked
      ? [...state.value, target.value]
      : state.value.filter(val => String(val) !== String(target.value));

    //if (!state.isControlled) {
    setState("valueState", nextValue);
    //}

    local.onChange?.(nextValue);
  };

  const context: CheckboxGroupContextValue = {
    state: state as CheckboxGroupState,
    onChange,
  };

  return (
    <CheckboxGroupContext.Provider value={context} {...others}>
      {local.children}
    </CheckboxGroupContext.Provider>
  );
}

export function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext);
}
