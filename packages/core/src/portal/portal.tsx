import { FlowProps } from "solid-js";
import { Portal } from "solid-js/web";

export function HopePortal(props: FlowProps) {
  return (
    <Portal>
      <div class="hope-portal">{props.children}</div>
    </Portal>
  );
}
