import { type ButtonType, createButton } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { composeEventHandlers, runIfFunction } from "@hope-ui/primitives/utils";
import type {
  ButtonColorScheme,
  ButtonLoaderPlacement,
  ButtonSize,
  ButtonThemeableProps,
  ButtonVariant,
  SlotClasses,
} from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, children, createEffect, merge, omit, Show } from "solid-js";
import { LoaderCircleIcon } from "../icons";

// The recipe contract is owned by `@hope-ui/theming`; re-exported here so consumers can import the
// vocabulary from the component's subpath.
export type { ButtonColorScheme, ButtonLoaderPlacement, ButtonSize, ButtonVariant };

// The role selector is `colorScheme`, not `color`: a `color` prop would shadow the native HTML
// `color` attribute, which is left untouched and forwarded through `...rest`.
type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

// Extending `ButtonThemeableProps` (rather than re-declaring the variants) keeps the component props
// and the themeable surface in lockstep by construction. The two chrome-content keys are `Omit`-ted
// and re-declared wider below: the themeable surface narrows them to a factory (reuse-safe as an
// app-wide default), while a per-instance prop also accepts a bare `JSX.Element`.
export interface ButtonProps
  extends ButtonElementProps,
    Omit<ButtonThemeableProps, "loader" | "loadingText"> {
  /**
   * Renders as a different element/component while keeping Button's computed props. The only
   * polymorphism mechanism (there is no `as` prop).
   */
  render?: RenderProp<ButtonElementProps>;
  /**
   * Set `false` when `render`-ing a non-`<button>` element (an `<a>`, a `<div>`). It switches
   * the accessibility model to `role="button"` + `tabIndex` + `aria-disabled` and synthesizes
   * keyboard activation, since those elements have none of a native button's built-in behavior.
   * Default `true`. Per-usage, so it is **not** a themeable app-wide default.
   */
  nativeButton?: boolean;
  /**
   * Disables the button. A native button uses the `disabled` attribute; a non-native element
   * uses `aria-disabled` and blocked handlers (and should also drop its `href` if it's a link).
   * Keeps its `variant`/`colorScheme` colors, dimmed via the `opacity-disabled` token.
   */
  disabled?: boolean;
  /**
   * Shows a loader and blocks activation while keeping its place in the tab order. Dims the chrome
   * via the `opacity-loading` token (its own, deeper dim than disabled) instead of the native
   * `disabled` attribute. Sets `aria-busy`.
   */
  loading?: boolean;
  /**
   * Replaces the label while loading (implies an inline `start` loader so the text stays visible).
   * A bare element is per-instance; the factory form is what a preset supplies as an app-wide
   * `defaultProps.loadingText`, so a shared default renders a fresh subtree per instance rather than
   * moving one node between buttons (resolved via `runIfFunction`).
   */
  loadingText?: JSX.Element | (() => JSX.Element);
  /** Custom loader content; defaults to hope's loader. Same element/factory split as `loadingText`. */
  loader?: JSX.Element | (() => JSX.Element);
  /** Leading slot (typically an icon), before the label. */
  startDecorator?: JSX.Element;
  /** Trailing slot (typically an icon), after the label. */
  endDecorator?: JSX.Element;
  /** Merged over the recipe's root class so the consumer's utilities win (via `cn`). */
  class?: string;
  /**
   * Per-instance class overrides, keyed by slot (`root`, `label`, `startDecorator`, `endDecorator`,
   * `loader`). Folded in after the recipe base and the preset's global `slotClasses`, before `class`
   * (root only) — so a later utility wins a Tailwind conflict. Use literal class strings so the
   * consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"button">;
}

export const Button: Component<ButtonProps> = (props) => {
  // Precedence: instance ?? preset `defaultProps` ?? builtin, each key resolved with `??`.
  const merged = useDefaults({
    recipe: "button",
    props,
    defaults: {
      type: "button" as const,
      nativeButton: true,
      variant: "default" as const,
      size: "md" as const,
      colorScheme: "primary" as const,
      loaderPlacement: "center" as const,
      loading: false,
      fullWidth: false,
      iconOnly: false,
    },
  });

  // Dev-only guard: an icon-only button has no visible text, so without `aria-label`/`aria-labelledby`
  // it announces as an unnamed button. In a `createEffect` so it never runs during SSR; deps are read
  // in the tracking function, not the callback, to avoid `STRICT_READ_UNTRACKED`.
  createEffect(
    () => [merged.iconOnly, merged["aria-label"], merged["aria-labelledby"]] as const,
    ([iconOnly, ariaLabel, ariaLabelledby]) => {
      const isDev = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV;
      if (!isDev || !iconOnly) {
        return;
      }
      if (ariaLabel == null && ariaLabelledby == null) {
        console.warn(
          "[hope-ui] Button: an icon-only button (iconOnly) has no accessible name. " +
            "Pass an `aria-label` (or `aria-labelledby`) so assistive tech can announce it.",
        );
      }
    },
  );

  const isLoading = () => merged.loading;

  // Each of these component-valued props is read more than once below, so it is resolved once here
  // and every read site uses the resolved accessor. Two guarantees: single construction (a JSX-prop
  // getter re-runs `createComponent` on every read), and correct hydration for the decorators, whose
  // `<Show>` `when`-gate read would otherwise build and discard a component the client and server
  // key differently. Decision procedure: `__internal__/solid-2.0-notes.md` § children().
  const startDecorator = children(() => merged.startDecorator);
  const endDecorator = children(() => merged.endDecorator);
  const loader = children(() => runIfFunction(merged.loader) ?? <LoaderCircleIcon />);
  const loadingText = children(() => runIfFunction(merged.loadingText));
  const label = children(() => merged.children);

  // `loadingText` keeps the label visible, so it implies an inline `start` loader rather than the
  // label-hiding `center` overlay.
  const loaderEffectivePlacement = (): ButtonLoaderPlacement =>
    loadingText() != null ? "start" : merged.loaderPlacement;

  // One class fn per slot, each folding the override chain: recipe base → preset `slotClasses` →
  // instance `slotClasses` → `class` (root only). Only the recipe variants are passed — chrome
  // content isn't style, and runtime state reaches the recipe through its `data-*`/`aria-*` variants.
  const slots = useSlots({
    recipe: "button",
    variantsProps: () => ({
      variant: merged.variant,
      colorScheme: merged.colorScheme,
      size: merged.size,
      fullWidth: merged.fullWidth,
      iconOnly: merged.iconOnly,
      // Layout only, and only while loading — the loader slot itself is mounted by `<Show>` below,
      // so an unset placement (not loading) applies nothing.
      loaderPlacement: isLoading() ? loaderEffectivePlacement() : undefined,
    }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  // `createButton` owns the element-aware a11y props, disabled-gating, and the press engine. The
  // loading guard wraps the consumer's `onClick`: its `preventDefault()` travels
  // `composeEventHandlers`' cancel channel to stop both the consumer's handler and the press
  // engine's `onPress`, blocking activation without the disabled attribute — so the button keeps its
  // enabled look and tab position.
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
    "colorScheme",
    "loading",
    "loadingText",
    "loader",
    "loaderPlacement",
    "startDecorator",
    "endDecorator",
    "fullWidth",
    "iconOnly",
    "class",
    "slotClasses",
    "children",
  );

  // Only the root goes through `renderElement` (it owns `render` polymorphism + ref merging); the
  // internal parts are always plain spans.
  const content = (
    <>
      <Show when={startDecorator() != null}>
        <span data-slot="button-start-decorator" class={slots.startDecorator()}>
          {startDecorator()}
        </span>
      </Show>
      <span data-slot="button-label" class={slots.label()}>
        {isLoading() && loadingText() != null ? loadingText() : label()}
      </span>
      <Show when={endDecorator() != null}>
        <span data-slot="button-end-decorator" class={slots.endDecorator()}>
          {endDecorator()}
        </span>
      </Show>
      <Show when={isLoading()}>
        <span data-slot="button-loader" class={slots.loader()} aria-hidden="true">
          {loader()}
        </span>
      </Show>
    </>
  );

  const elementProps = merge(rest, button.buttonProps, {
    get class(): string {
      return slots.root();
    },
    // The accessible loading signal. Byte-stable: `loading` is the same on the server and initial
    // client, so a non-loading button emits no `aria-busy` on either.
    get "aria-busy"(): "true" | undefined {
      return isLoading() ? "true" : undefined;
    },
    // Parts use the `button-<part>` convention; `data-disabled`/`data-pressed` come from
    // `button.buttonProps` above.
    "data-slot": "button",
    children: content,
  });

  return renderElement<ButtonElementProps, HTMLButtonElement>({
    as: "button",
    render: merged.render,
    props: elementProps as unknown as ButtonElementProps,
    ref: button.setRef,
  });
};
