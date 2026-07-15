import { type ButtonType, createButton } from "@hope-ui/primitives/internal";
import {
  composeEventHandlers,
  type RenderProp,
  renderElement,
  withDefaults,
} from "@hope-ui/primitives/utils";
import type { ButtonColor, ButtonSize, ButtonVariant } from "@hope-ui/theming";
import { useRecipe } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, createMemo, merge, omit, Show } from "solid-js";

// The recipe contract (variant vocabulary + slots) is owned by `@hope-ui/theming` — the component
// consumes it via `useRecipe`, never declares it (no module augmentation). Re-export the vocabulary
// so consumers can still import it from the component's subpath.
export type { ButtonColor, ButtonSize, ButtonVariant };

/** Where the loader sits — a component-level prop, not part of the recipe's variant vocabulary. */
export type ButtonLoaderPlacement = "start" | "center" | "end";

// `color` shadows the native HTML `color` attribute, so it is dropped from the forwarded native
// props and redefined below as the recipe's role selector.
type ButtonElementProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "color">;

export interface ButtonProps extends ButtonElementProps {
  /** Visual style. `default` is the neutral chrome button (shadcn's outline) and ignores `color`. */
  variant?: ButtonVariant;
  /** Density/scale. Heights 28/32/36/40/44px for xs→xl. */
  size?: ButtonSize;
  /** Semantic role color. Ignored by the `default` variant. */
  color?: ButtonColor;
  /**
   * Renders as a different element/component while keeping Button's computed props. The only
   * polymorphism mechanism (there is no `as` prop).
   */
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
   * Rendered as a neutral, grayed-out chrome regardless of `variant`/`color`.
   */
  disabled?: boolean;
  /**
   * Shows a loading spinner and blocks activation, while keeping the button's normal (non-disabled)
   * look and its place in the tab order. Sets `aria-busy`.
   */
  loading?: boolean;
  /** Replaces the label while loading (implies an inline `start` spinner so the text stays visible). */
  loadingText?: JSX.Element;
  /** Custom loader content. Defaults to hope's spinner. */
  loader?: JSX.Element;
  /** Where the loader sits. `center` (default) overlays it and hides the label, preserving width. */
  loaderPlacement?: ButtonLoaderPlacement;
  /** Leading slot (typically an icon), before the label. */
  startDecorator?: JSX.Element;
  /** Trailing slot (typically an icon), after the label. */
  endDecorator?: JSX.Element;
  /** Stretches the button to the full width of its container. */
  fullWidth?: boolean;
  /** Merged over the recipe's root class so the consumer's utilities win (via `cn`). */
  class?: string;
}

/**
 * hope's default spinner — two SVG parts the recipe's `loader` slot styles by hook class
 * (`.hope-spinner-track` faint, `.hope-spinner-head` spinning).
 */
function ButtonSpinner(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <circle class="hope-spinner-track" cx="12" cy="12" r="9" />
      <path class="hope-spinner-head" d="M12 3a9 9 0 0 1 9 9" />
    </svg>
  );
}

export const Button: Component<ButtonProps> = (props) => {
  // `withDefaults`, not `merge({...}, props)`: `merge` resolves by key presence, so a wrapper
  // forwarding an unset `type`/`variant`/… would drop the default. See `withDefaults`' doc.
  const merged = withDefaults(props, {
    type: "button" as const,
    nativeButton: true,
    variant: "default" as const,
    size: "md" as const,
    color: "primary" as const,
    loaderPlacement: "center" as const,
    loading: false,
    fullWidth: false,
  });

  const isLoading = () => merged.loading;
  // `loadingText` keeps the label visible, so it implies an inline `start` spinner rather than the
  // label-hiding `center` overlay.
  const effectivePlacement = (): ButtonLoaderPlacement =>
    merged.loadingText != null ? "start" : merged.loaderPlacement;

  const recipe = useRecipe("button");
  const styles = createMemo(() =>
    recipe({
      variant: merged.variant,
      color: merged.color,
      size: merged.size,
      fullWidth: merged.fullWidth,
      loading: isLoading() ? effectivePlacement() : "none",
    }),
  );

  // `createButton` owns the element-aware a11y props, the disabled-gating, and the press engine.
  // The consumer's `onClick` is wrapped with a loading guard first: while loading, it
  // `preventDefault()`s, which — through `composeEventHandlers`' cancel channel — stops the
  // consumer's handler AND the press engine's click-driven `onPress`, so activation is blocked
  // without the disabled attribute (the button keeps its enabled look and tab position).
  const button = createButton<HTMLButtonElement>({
    disabled: () => merged.disabled ?? false,
    nativeButton: () => merged.nativeButton,
    type: () => merged.type as ButtonType,
    // The focus ring is CSS `:focus-visible`, which already shows only for keyboard focus. Skip the
    // press engine's programmatic focus-on-press — a scripted `.focus()` during pointer-down makes
    // `:focus-visible` match on a mouse click too, i.e. the ring flashing on click. Native focus on
    // click still happens (Chromium), it just isn't `:focus-visible`, so no ring.
    preventFocusOnPress: () => true,
    onClick: () =>
      composeEventHandlers<HTMLButtonElement, MouseEvent>((event) => {
        if (isLoading()) {
          event.preventDefault();
        }
      }, merged.onClick),
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
    "variant",
    "size",
    "color",
    "loading",
    "loadingText",
    "loader",
    "loaderPlacement",
    "startDecorator",
    "endDecorator",
    "fullWidth",
    "class",
    "children",
  );

  // Only the root goes through `renderElement` (it owns `render`/`as` polymorphism + ref merging).
  // The internal parts are always plain spans, so they're written as literal elements.
  const children = (
    <>
      <Show when={merged.startDecorator != null}>
        <span data-slot="start-decorator" class={styles().startDecorator()}>
          {merged.startDecorator}
        </span>
      </Show>
      <span data-slot="label" class={styles().label()}>
        {isLoading() && merged.loadingText != null ? merged.loadingText : merged.children}
      </span>
      <Show when={merged.endDecorator != null}>
        <span data-slot="end-decorator" class={styles().endDecorator()}>
          {merged.endDecorator}
        </span>
      </Show>
      <Show when={isLoading()}>
        <span data-slot="loader" class={styles().loader()} aria-hidden="true">
          {merged.loader ?? <ButtonSpinner />}
        </span>
      </Show>
    </>
  );

  const elementProps = merge(rest, button.buttonProps, {
    get class(): string {
      // The recipe's own slot function merges the consumer's `class` last, through the `tv`
      // tailwind-merge config — so their utilities win a conflict without a separate `cn`.
      return styles().root({ class: merged.class });
    },
    // `aria-busy` is the accessible loading signal. Byte-stable: `loading` is the same value on the
    // server and initial client, so a non-loading button emits no `aria-busy` on either.
    get "aria-busy"(): "true" | undefined {
      return isLoading() ? "true" : undefined;
    },
    // Byte-stable: `isPressed()` is `false` on the server and initial client, so `data-pressed`
    // is absent from both — it only ever appears client-side once a press is active.
    get "data-pressed"(): "" | undefined {
      return button.isPressed() ? "" : undefined;
    },
    children,
  });

  return renderElement<ButtonElementProps, HTMLButtonElement>({
    as: "button",
    render: merged.render,
    props: elementProps as unknown as ButtonElementProps,
    ref: button.setRef,
  });
};
