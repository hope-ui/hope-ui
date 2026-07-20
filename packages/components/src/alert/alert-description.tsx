import { createRegisteredId } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Component, createUniqueId, merge, omit } from "solid-js";
import { useAlertContext } from "./alert-context";

export interface AlertDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  render?: RenderProp<JSX.HTMLAttributes<HTMLParagraphElement>>;
}

export const Description: Component<AlertDescriptionProps> = (props) => {
  const ctx = useAlertContext();
  const generatedId = createUniqueId();
  const id = (): string => (typeof props.id === "string" ? props.id : generatedId);

  createRegisteredId({ id, register: ctx.registerDescriptionId });

  const rest = omit(props, "render");
  const elementProps = merge(rest, {
    get id(): string {
      return id();
    },
    get class(): string {
      return ctx.slots.description();
    },
    "data-slot": "alert-description",
  });

  return renderElement<JSX.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>({
    as: "p",
    render: props.render,
    props: elementProps,
  });
};
