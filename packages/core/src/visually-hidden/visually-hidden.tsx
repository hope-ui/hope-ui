import { createHopeComponent, createStyles, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

const useStyles = createStyles({
  base: {
    position: "absolute",
    overflow: "hidden",
    height: "1px",
    width: "1px",
    margin: "0 -1px -1px 0",
    border: 0,
    padding: 0,
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
});

/**
 * `VisuallyHidden` hides its children visually but keeps content visible to assistive technology.
 */
export const VisuallyHidden = createHopeComponent<"span">(props => {
  const [local, others] = splitProps(props, ["class"]);

  const className = useStyles();

  return <hope.span class={clsx(className(), local.class)} {...others} />;
});

/**
 * A `VisuallyHidden` input used to create custom input components like checkbox, radio and switch.
 */
export const VisuallyHiddenInput = createHopeComponent<"input">(props => {
  const [local, others] = splitProps(props, ["class"]);

  const className = useStyles();

  return <hope.input class={clsx(className(), local.class)} {...others} />;
});
