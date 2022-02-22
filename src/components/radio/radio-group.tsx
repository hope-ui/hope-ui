import { createContext, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { ThemeableRadioOptions } from "./radio";

interface RadioGroupOptions extends ThemeableRadioOptions {
  /**
   * The `name` attribute forwarded to each `radio` element
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
   * and `required` attribute will be added
   */
  required?: boolean;

  /**
   * If `true`, all wrapped radio inputs will be disabled
   */
  disabled?: boolean;

  /**
   * If `true`, all wrapped radio inputs will be readonly
   */
  readOnly?: boolean;

  /**
   * If `true`, all wrapped radio inputs will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * Function called once a radio is checked
   * @param event the original event emitted by the `Radio` checked state changes
   * @param value the value of the checked radio
   */
  onChange?: (event: Event, value: string | number) => void;
}

type RadioGroupState = Omit<RadioGroupOptions, "name" | "onChange"> & {
  valueState?: string | number;
  isControlled: boolean;
  name: string;
};

interface RadioGroupContextValue {
  state: RadioGroupState;

  /**
   * The callback invoked when the checked state of the `Radio` in `RadioGroup` changes.
   */
  onChange: JSX.EventHandlerUnion<HTMLInputElement, Event>;
}

const RadioGroupContext = createContext<RadioGroupContextValue>();

export type RadioGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C, RadioGroupOptions>;

const hopeRadioGroupClass = "hope-radio-group";

export function RadioGroup<C extends ElementType = "div">(props: RadioGroupProps<C>) {
  const defaultName = `hope-radio-group-${createUniqueId()}`;

  const [state, setState] = createStore<RadioGroupState>({
    // Internal state for uncontrolled radio-group.
    // eslint-disable-next-line solid/reactivity
    valueState: props.defaultValue,
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
    get readOnly() {
      return props.readOnly;
    },
    get invalid() {
      return props.invalid;
    },
    get variant() {
      return props.variant;
    },
    get colorScheme() {
      return props.colorScheme;
    },
    get size() {
      return props.size;
    },
    get labelPosition() {
      return props.labelPosition;
    },
  });

  const [local, others] = splitProps(props, [
    "class",
    "value",
    "defaultValue",
    "name",
    "required",
    "disabled",
    "readOnly",
    "invalid",
    "onChange",
  ]);

  const classes = () => classNames(local.class, hopeRadioGroupClass);

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    const value = (event.target as HTMLInputElement).value;

    if (!state.isControlled) {
      setState("valueState", value);
    }

    local.onChange?.(event, value);
  };

  const context: RadioGroupContextValue = {
    state,
    onChange,
  };

  return (
    <RadioGroupContext.Provider value={context}>
      <Box role="radiogroup" class={classes()} {...others} />
    </RadioGroupContext.Provider>
  );
}

RadioGroup.toString = () => createClassSelector(hopeRadioGroupClass);

export function useRadioGroupContext() {
  return useContext(RadioGroupContext);
}
