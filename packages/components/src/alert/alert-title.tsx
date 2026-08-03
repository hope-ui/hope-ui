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

  // Publish the id so `Alert.Root` can point `aria-labelledby` at it. The write is deferred past the
  // render pass: writing a signal owned by an ancestor from inside a descendant's synchronous render
  // body throws `REACTIVE_WRITE_IN_OWNED_SCOPE`.
  createRegisteredId({ id, register: ctx.registerTitleId });

  const rest = omit(props, "render", "class");
  const elementProps = merge(rest, {
    get id(): string {
      return id();
    },
    get class(): string {
      return ctx.slots.title(props.class);
    },
    "data-slot": "alert-title",
  });

  return renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
    as: "div",
    render: props.render,
    props: elementProps,
  });
};
