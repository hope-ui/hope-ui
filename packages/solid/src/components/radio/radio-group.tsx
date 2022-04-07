import { createContext, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { ThemeableRadioOptions } from "./radio";

interface RadioGroupOptions extends ThemeableRadioOptions {
  /**
   * The `name` attribute forwarded to each `radio` element.
   */
  name?: string;

  /**
   * The value of the radio to be `checked`.
   * (in controlled mode)
   */
  value?: string | number;

  /**
   * The value of the radio to be `checked` initially.
   * (in uncontrolled mode)
   */
  defaultValue?: string | number;

  /**
   * If `true`, all wrapped radio inputs will be marked as required,
   * and `required` attribute will be added.
   */
  required?: boolean;

  /**
   * If `true`, all wrapped radio inputs will be disabled.
   */
  disabled?: boolean;

  /**
   * If `true`, all wrapped radio inputs will have `aria-invalid` set to `true`.
   */
  invalid?: boolean;

  /**
   * If `true`, all wrapped radio inputs will be readonly.
   */
  readOnly?: boolean;

  /**
   * Callback invoked once a radio is checked.
   * @param value the value of the checked radio
   */
  onChange?: (value: string) => void;
}

export type RadioGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, RadioGroupOptions>;

interface RadioGroupState extends Omit<RadioGroupOptions, "name" | "onChange"> {
  /**
   * The `name` attribute forwarded to each `radio` element.
   */
  name: string;

  /**
   * The value of the radio to be `checked`.
   * (in uncontrolled mode)
   */
  _value?: string | number;

  /**
   * If `true`, the radio group is in controlled mode.
   * (have value and onChange props)
   */
  isControlled: boolean;
}

const hopeRadioGroupClass = "hope-radio-group";

/**
 * RadioGroup provides context for all its radio childrens.
 */
export function RadioGroup<C extends ElementType = "div">(props: RadioGroupProps<C>) {
  const defaultRadioName = `hope-radio-group-${createUniqueId()}--radio`;

  const theme = useComponentStyleConfigs().Radio;

  const [state, setState] = createStore<RadioGroupState>({
    // eslint-disable-next-line solid/reactivity
    _value: props.defaultValue,
    get isControlled() {
      return props.value !== undefined;
    },
    get value() {
      return this.isControlled ? props.value : this._value;
    },
    get name() {
      return props.name ?? defaultRadioName;
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
    const value = (event.target as HTMLInputElement).value;

    setState("_value", value);

    local.onChange?.(String(value));
  };

  const classes = () => classNames(local.class, hopeRadioGroupClass);

  const context: RadioGroupContextValue = {
    state,
    onChange,
  };

  return (
    <RadioGroupContext.Provider value={context}>
      <Box role="radiogroup" class={classes()} __baseStyle={theme?.baseStyle?.group} {...others} />
    </RadioGroupContext.Provider>
  );
}

RadioGroup.toString = () => createClassSelector(hopeRadioGroupClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface RadioGroupContextValue {
  state: RadioGroupState;

  /**
   * The callback invoked when the checked state of a `Radio` in `RadioGroup` changes.
   */
  onChange: JSX.EventHandlerUnion<HTMLInputElement, Event>;
}

const RadioGroupContext = createContext<RadioGroupContextValue>();

export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}
