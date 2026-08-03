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

// Re-exported so consumers get the variant vocabulary from the component's own subpath, without
// importing `@hope-ui/theming` directly.
export type { ButtonColorScheme, ButtonLoaderPlacement, ButtonSize, ButtonVariant };

// The role selector is named `colorScheme`, not `color`, so it does not shadow the native HTML
// `color` attribute — which stays untouched and is forwarded like any other native attribute.
type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

// Extending the themeable props rather than re-declaring the variants keeps the two in lockstep by
// construction. `loader`/`loadingText` are the exception: as an app-wide default they must be
// factories (a single shared element would *move* between buttons), but per instance a bare element
// is fine — so they are `Omit`-ted and re-declared wider below.
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
   * Replaces the label while loading, which implies an inline `start` loader so the text stays
   * visible. Pass a bare element per instance; a preset's app-wide default must be a factory, so
   * every button builds its own subtree instead of sharing (and moving) one node.
   */
  loadingText?: JSX.Element | (() => JSX.Element);
  /** Custom loader content; defaults to hope's. Same element/factory split as `loadingText`. */
  loader?: JSX.Element | (() => JSX.Element);
  /** Leading slot (typically an icon), before the label. */
  startDecorator?: JSX.Element;
  /** Trailing slot (typically an icon), after the label. */
  endDecorator?: JSX.Element;
  /** Merged over the recipe's root class so the consumer's utilities win (via `cn`). */
  class?: string;
  /**
   * Per-instance class overrides, keyed by slot (`root`, `label`, `startDecorator`, `endDecorator`,
   * `loader`). Applied after the recipe base and the preset's global `slotClasses`, and before
   * `class` — the later utility wins a Tailwind conflict. Write them as literal class strings, or
   * the consumer's Tailwind scanner will not see them.
   */
  slotClasses?: SlotClasses<"button">;
}

export const Button: Component<ButtonProps> = (props) => {
  // Precedence: instance prop ?? the preset's `defaultProps` ?? the builtins below, each key
  // resolved with `??`.
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

  // Dev-only guard: an icon-only button has no visible text, so with neither `aria-label` nor
  // `aria-labelledby` it announces as an unnamed button. Inside an effect so it never runs during
  // SSR, and its dependencies are read in the tracking function rather than the callback — Solid
  // flags a reactive read from the callback as `STRICT_READ_UNTRACKED`.
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

  // Every one of these props can hold a component and is read more than once below, so each is
  // resolved once here and every read site uses the memoized accessor. A JSX-valued prop compiles to
  // a lazy getter that re-runs `createComponent` on *every* read, so a raw read at each site would
  // build the component several times and throw the extras away. It also fixes hydration for the
  // decorators: a raw `<Show when={prop != null}>` builds and discards a component, which shifts
  // where the client thinks the next node is relative to the server HTML.
  const startDecorator = children(() => merged.startDecorator);
  const endDecorator = children(() => merged.endDecorator);
  const loader = children(() => runIfFunction(merged.loader) ?? <LoaderCircleIcon />);
  const loadingText = children(() => runIfFunction(merged.loadingText));
  const label = children(() => merged.children);

  // `loadingText` keeps the label visible, so it implies an inline `start` loader rather than the
  // label-hiding `center` overlay.
  const loaderEffectivePlacement = (): ButtonLoaderPlacement =>
    loadingText() != null ? "start" : merged.loaderPlacement;

  // One class function per slot, each folding in the whole override chain: recipe base → preset
  // `slotClasses` → instance `slotClasses` → `class` (root only). Only the styling variants are
  // passed; runtime state reaches the recipe through `data-*`/`aria-*` selectors instead.
  const slots = useSlots({
    recipe: "button",
    variantsProps: () => ({
      variant: merged.variant,
      colorScheme: merged.colorScheme,
      size: merged.size,
      fullWidth: merged.fullWidth,
      iconOnly: merged.iconOnly,
      // Layout only, and only while loading — the loader element itself is mounted below, so an
      // unset placement applies nothing.
      loaderPlacement: isLoading() ? loaderEffectivePlacement() : undefined,
    }),
    slotClasses: () => merged.slotClasses,
  });

  // `createButton` owns the element-aware ARIA, the disabled gating and the press handling. The
  // loading guard runs *before* the consumer's `onClick`, and its `preventDefault()` cancels both
  // that handler and the press activation — which blocks the button without the `disabled`
  // attribute, so it keeps its enabled look and its place in the tab order.
  const button = createButton<HTMLButtonElement>({
    disabled: () => merged.disabled ?? false,
    nativeButton: () => merged.nativeButton,
    type: () => merged.type as ButtonType,
    // The focus ring is `:focus-visible`, which already shows only for keyboard focus. A scripted
    // `.focus()` during pointer-down makes `:focus-visible` match a mouse click too, so the ring
    // would flash on every click. The browser still focuses the button on click either way.
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

  // Only the root goes through `renderElement`, which is what implements the `render` prop and merges
  // refs. The inner parts are always plain spans, so they are written as literal elements.
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
      return slots.root(merged.class);
    },
    // Safe for hydration: `loading` has the same value on the server and on the first client
    // render, so a non-loading button emits no `aria-busy` on either side.
    get "aria-busy"(): "true" | undefined {
      return isLoading() ? "true" : undefined;
    },
    // The root's own marker; the inner parts use the `button-<part>` convention. The state hooks a
    // recipe selects on (`data-disabled`/`data-pressed`) come from `button.buttonProps` above.
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
