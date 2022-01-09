import { createSignal } from "solid-js";

import { styled } from "./lib/stitches/styled";

const Link = styled("a");
const Button = styled("button", {
  appearance: "none",
  position: "relative",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "$base",
  fontWeight: "$semibold",
  lineHeight: "$none",
  cursor: "pointer",
  userSelect: "none",
  outline: "none",
  transition: "color 250ms, background-color 250ms",

  "&:not(:disabled):active": {
    transform: "translateY(1px)",
  },

  "&:focus-visible": {
    outline: "$primary500 solid 2px",
    outlineOffset: "2px",
  },

  variants: {
    variant: {
      filled: {
        border: "1px solid transparent",
        color: "white",
      },
      default: {
        border: "1px solid $neutral400)",
        backgroundColor: "white",
        color: "$dark900",
        "&:not(:disabled):hover": {
          backgroundColor: "$neutral50",
        },
      },
    },
    size: {
      xs: {},
      sm: {
        height: "36px",
        padding: "0 18px",
        fontSize: "$sm",
      },
      md: {},
      lg: {},
      xl: {},
    },
  },

  compoundVariants: [
    {
      variant: "filled",
      color: "primary",
      css: {
        backgroundColor: "$primary600",
        "&:hover": {
          backgroundColor: "$primary700",
        },
      },
    },
  ],

  defaultVariants: {
    variant: "filled",
    color: "primary",
    size: "sm",
  },
});

export default function App() {
  const [color, setColor] = createSignal("primary");

  const changeColor = () => setColor(c => (c === "primary" ? "danger" : "primary"));

  return (
    <div>
      <Button onClick={changeColor}>Change color</Button>
    </div>
  );
}
