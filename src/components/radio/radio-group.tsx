import { createContext, createEffect, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";

interface RadioGroupOptions {
  /**
   * The `name` attribute forwarded to each `radio` element
   */
  name?: string;

  /**
   * The value of the radio to be `checked`.
   */
  value?: string | number;

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

export type RadioGroupProps<C extends ElementType = "div"> = HopeComponentProps<
  C,
  RadioGroupOptions
>;

const hopeRadioGroupClass = "hope-radio-group";

export function RadioGroup<C extends ElementType = "div">(props: RadioGroupProps<C>) {
  const defaultName = `hope-radio-group-${createUniqueId()}`;

  const [state, setState] = createStore<RadioGroupState>({
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
    // eslint-disable-next-line solid/reactivity
    value: props.value,
  });

  const [local, others] = splitProps(props, [
    "class",
    "value",
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

    setState("value", value);

    local.onChange?.(event, value);
  };

  createEffect(() => setState("value", local.value));

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
