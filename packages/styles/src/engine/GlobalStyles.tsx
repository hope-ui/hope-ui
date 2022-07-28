import { injectGlobal } from "@emotion/css";
import { createEffect } from "solid-js";

import { useHopeTheme } from "../theme";
import { CSSObject, HopeTheme } from "../types";

type EmotionStyles = CSSObject | CSSObject[];

interface GlobalStylesProps {
  styles: EmotionStyles | ((theme: HopeTheme) => EmotionStyles);
}

export function GlobalStyles(props: GlobalStylesProps) {
  const theme = useHopeTheme();

  createEffect(() => {
    console.log("fired");
    injectGlobal(typeof props.styles === "function" ? props.styles(theme()) : props.styles);
  });

  return <></>;
}
