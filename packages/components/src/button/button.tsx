import { type ButtonType, createButton } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement, withDefaults } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export interface ButtonProps extends ButtonElementProps {
  /** Renders as a different element/component while keeping Button's computed props. */
  render?: RenderProp<ButtonElementProps>;
  /**
   * Set `false` when `render`-ing a non-`<button>` element (an `<a>`, a `<div>`). It switches
   * the accessibility model to `role="button"` + `tabIndex` + `aria-disabled` and synthesizes
   * keyboard activation, since those elements have none of a native button's built-in behavior.
   * Default `true`.
   */
  nativeButton?: boolean;
  /**
   * Disables the button. A native button uses the `disabled` attribute; a non-native element
   * uses `aria-disabled` and blocked handlers (and should also drop its `href` if it's a link).
   */
  disabled?: boolean;
}

export const Button: Component<ButtonProps> = (props) => {
  // `withDefaults`, not `merge({ type: "button" }, props)`: `merge` resolves by key
  // presence, so `<Button type={props.type}>` with `type` unset would drop `type="button"`
  // entirely and submit the surrounding form. See `withDefaults`' doc.
  const merged = withDefaults(props, { type: "button" as const, nativeButton: true });

  // `createButton` owns the element-aware a11y props, the disabled-gating, and the press
  // engine. The consumer's interaction handlers are threaded through it (as accessors, read
  // reactively) so they compose in the correct order — disabled-guard, consumer, then press.
  const button = createButton<HTMLButtonElement>({
    disabled: () => merged.disabled ?? false,
    nativeButton: () => merged.nativeButton,
    type: () => merged.type as ButtonType,
    onClick: () => merged.onClick,
    onKeyDown: () => merged.onKeyDown,
    onKeyUp: () => merged.onKeyUp,
    onPointerDown: () => merged.onPointerDown,
  });

  const rest = omit(
    merged,
    "render",
    "disabled",
    "nativeButton",
    "type",
    "onClick",
    "onKeyDown",
    "onKeyUp",
    "onPointerDown",
  );

  const elementProps = merge(rest, button.buttonProps, {
    // Byte-stable: `isPressed()` is `false` on the server and initial client, so `data-pressed`
    // is absent from both — it only ever appears client-side once a press is active.
    get "data-pressed"(): "" | undefined {
      return button.isPressed() ? "" : undefined;
    },
  });

  return renderElement<ButtonElementProps, HTMLButtonElement>({
    as: "button",
    render: merged.render,
    props: elementProps as unknown as ButtonElementProps,
    ref: button.setRef,
  });
};
