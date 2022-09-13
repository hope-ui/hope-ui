import { createHopeComponent, hope } from "@hope-ui/styles";
import { ComponentProps, createContext, splitProps, useContext } from "solid-js";

import { mergeDefaultProps } from "../utils";
import { ButtonProps } from "./types";

const BaseButtonGroup = hope(
  "div",
  {
    baseStyle: {
      display: "inline-flex",

      "& > *:focus": {
        zIndex: 1,
      },
    },
    variants: {
      orientation: {
        horizontal: {
          flexDirection: "row",

          "& > *:first-of-type:not(:last-of-type)": {
            borderRightRadius: 0,
          },
          "& > *:not(:first-of-type):not(:last-of-type)": {
            borderRadius: 0,
            marginLeft: "-1px",
          },
          "& > *:not(:first-of-type):last-of-type": {
            borderLeftRadius: 0,
            marginLeft: "-1px",
          },
        },
        vertical: {
          flexDirection: "column",

          "& > *:first-of-type:not(:last-of-type)": {
            borderBottomRadius: 0,
          },
          "& > *:not(:first-of-type):not(:last-of-type)": {
            borderRadius: 0,
            marginTop: "-1px",
          },
          "& > *:not(:first-of-type):last-of-type": {
            borderTopRadius: 0,
            marginTop: "-1px",
          },
        },
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
  "hope-ButtonGroup-root"
);

type ButtonGroupContextValue = Pick<ButtonProps, "colorScheme" | "variant" | "size" | "isDisabled">;

const ButtonGroupContext = createContext<ButtonGroupContextValue>();

export function useButtonGroupContext() {
  return useContext(ButtonGroupContext);
}

export type ButtonGroupProps = ComponentProps<typeof BaseButtonGroup> & ButtonGroupContextValue;

export const ButtonGroup = createHopeComponent<"div", ButtonGroupProps>(props => {
  props = mergeDefaultProps({}, props);

  const [local, contextValue, others] = splitProps(
    props,
    ["orientation"],
    ["variant", "colorScheme", "size", "isDisabled"]
  );

  return (
    <ButtonGroupContext.Provider value={contextValue}>
      <BaseButtonGroup role="group" orientation={local.orientation} {...others} />
    </ButtonGroupContext.Provider>
  );
});
