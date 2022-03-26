import { createSignal, splitProps } from "solid-js";

import { createClassSelector } from "@/utils/css";

import { Button, ButtonOptions, hopeButtonClass } from "../button/button";
import { ElementType, HTMLHopeProps } from "../types";

export interface AsyncButtonOptions extends ButtonOptions {
  onClick?: (event: MouseEvent) => Promise<void>;
}

export type AsyncButtonProps<C extends ElementType = "button"> = HTMLHopeProps<C, AsyncButtonOptions>;

/**
 * AsyncButton renders regular Button component and manages loading state automatically.
 * Hence requires onClick handler to return a Promise.
 */
export function AsyncButton<C extends ElementType = "button">(props: AsyncButtonProps<C>) {
  const [local, others] = splitProps(props, ["onClick"]);
  const [loading, setLoading] = createSignal(false);

  const onClickInterceptor = (e: MouseEvent) => {
    if (local.onClick) {
      setLoading(true);
      local.onClick(e).finally(() => setLoading(false));
    }
  };

  return <Button loading={loading()} {...others} onClick={onClickInterceptor} />;
}

AsyncButton.toString = () => createClassSelector(hopeButtonClass);
