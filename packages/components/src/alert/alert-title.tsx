import { createRegisteredId } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type { JSX } from "@solidjs/web";
import { type Component, createUniqueId, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

export interface AlertTitleProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLDivElement>>;
}

export const Title: Component<AlertTitleProps> = (props) => {
  const ctx = useAlertContext();
  const generatedId = createUniqueId();
  const id = (): string => (typeof props.id === "string" ? props.id : generatedId);

  // Publish the id so `Alert.Root` can point `aria-labelledby` at it. `createRegisteredId` defers the
  // write past the synchronous render body (`onSettled`) so it never trips `REACTIVE_WRITE_IN_OWNED_SCOPE`.
  createRegisteredId({ id, register: ctx.registerTitleId });

  const rest = omit(props, "render");
  const elementProps = merge(rest, {
    get id(): string {
      return id();
    },
    get class(): string {
      return ctx.slots.title();
    },
    "data-slot": "alert-title",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
