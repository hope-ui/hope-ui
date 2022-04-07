import { createContext, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { ThemeableCheckboxOptions } from "./checkbox";

type CheckboxGroupValue = (string | number)[];

interface CheckboxGroupOptions extends ThemeableCheckboxOptions {
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

export type CheckboxGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, CheckboxGroupOptions>;

interface CheckboxGroupState extends Omit<CheckboxGroupProps, "name" | "onChange"> {
  /**
   * The `name` attribute forwarded to each `radio` element.
   */
  name: string;

  /**
   * The value of the radio to be `checked`.
   * (in uncontrolled mode)
   */
  _value: CheckboxGroupValue;

  /**
   * If `true`, the radio group is in controlled mode.
   * (have value and onChange props)
   */
  isControlled: boolean;
}

const hopeCheckboxGroupClass = "hope-checkbox-group";

export function CheckboxGroup<C extends ElementType = "div">(props: CheckboxGroupProps<C>) {
  const defaultName = `hope-checkbox-group-${createUniqueId()}--checkbox`;

  const theme = useComponentStyleConfigs().Checkbox;

  const [state, setState] = createStore<CheckboxGroupState>({
    // eslint-disable-next-line solid/reactivity
    _value: props.defaultValue ?? [],
    get isControlled() {
      return props.value !== undefined;
    },
    get value() {
      return this.isControlled ? props.value : this._value;
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
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    props,
    ["class", "onChange"],
    ["value", "defaultValue", "name", "required", "disabled", "readOnly", "invalid"]
  );

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (!state.value) {
      return;
    }

    const target = event.target as HTMLInputElement;

    const nextValue: CheckboxGroupValue = target.checked
      ? [...state.value, target.value]
      : state.value.filter(val => String(val) !== String(target.value));

    setState("_value", nextValue);

    local.onChange?.(nextValue);
  };

  const classes = () => classNames(local.class, hopeCheckboxGroupClass);

  const context: CheckboxGroupContextValue = {
    state: state as CheckboxGroupState,
    onChange,
  };

  return (
    <CheckboxGroupContext.Provider value={context}>
      <Box class={classes()} __baseStyle={theme?.baseStyle?.group} {...others} />
    </CheckboxGroupContext.Provider>
  );
}

CheckboxGroup.toString = () => createClassSelector(hopeCheckboxGroupClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface CheckboxGroupContextValue {
  state: CheckboxGroupState;

  /**
   * The callback invoked when the checked state of the `Checkbox` in `CheckboxGroup` changes.
   */
  onChange: JSX.EventHandlerUnion<HTMLInputElement, Event>;
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue>();

export function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext);
}
