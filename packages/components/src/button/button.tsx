import { type ButtonType, createButton } from "@hope-ui/primitives/internal";
import {
  composeEventHandlers,
  type RenderProp,
  renderElement,
  runIfFunction,
} from "@hope-ui/primitives/utils";
import type {
  ButtonColor,
  ButtonLoaderPlacement,
  ButtonSize,
  ButtonThemeableProps,
  ButtonVariant,
  SlotClasses,
} from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit, Show } from "solid-js";

// The recipe contract (variant vocabulary + slots) is owned by `@hope-ui/theming` — the component
// consumes it via `useRecipe`, never declares it (no module augmentation). Re-export the vocabulary
// so consumers can still import it from the component's subpath. `ButtonLoaderPlacement` is shared
// by the recipe's `loaderPlacement` variant and this component's `loaderPlacement` prop.
export type { ButtonColor, ButtonLoaderPlacement, ButtonSize, ButtonVariant };

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
   * Shows a loader and blocks activation, while keeping the button's normal (non-disabled)
   * look and its place in the tab order. Sets `aria-busy`.
   */
  loading?: boolean;
  /**
   * Replaces the label while loading (implies an inline `start` loader so the text stays visible).
   * Accepts a bare element (per-instance) or a factory `() => JSX.Element` — the factory form is what
   * a preset supplies as an app-wide `defaultProps.loadingText`, so a shared default renders a fresh
   * subtree per instance rather than moving one node between buttons (resolved via `runIfFunction`).
   */
  loadingText?: JSX.Element | (() => JSX.Element);
  /**
   * Custom loader content. Defaults to hope's loader. Accepts a bare element (per-instance) or a
   * factory `() => JSX.Element` — the factory form is what a preset supplies as an app-wide
   * `defaultProps.loader` (reuse-safe; see `loadingText`).
   */
  loader?: JSX.Element | (() => JSX.Element);
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
  /**
   * Per-instance class overrides, keyed by slot (`root`, `label`, `startDecorator`, `endDecorator`,
   * `loader`). Folded in after the recipe base and the preset's global `slotClasses`, before `class`
   * (root only) — so a later utility wins a Tailwind conflict. Use literal class strings so the
   * consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"button">;
}

// Compile-time drift guard (erased at build, enforced by `pnpm typecheck`): keep `ButtonProps` and
// the theming-declared `ButtonThemeableProps` aligned. Direction is **themeable ⊆ component props** —
// a preset `defaultProps` is merged in and read as `ButtonProps`, so every themeable key must exist on
// `ButtonProps` (1) and every themeable value must be a valid prop default (2). E.g. if `loader` were
// narrowed back to `JSX.Element` (dropping the factory), (2) would fail here, at the exact site.
type _MissingThemeableKeys = Exclude<keyof ButtonThemeableProps, keyof ButtonProps>;
const _noMissingThemeableKeys: _MissingThemeableKeys extends never ? true : never = true; // (1)
const _themeablePropsAreValidPropDefaults = (t: ButtonThemeableProps): ButtonProps => t; // (2)
void _noMissingThemeableKeys;
void _themeablePropsAreValidPropDefaults;

/**
 * hope's default loader — Lucide's `loader-circle`. A single arc the recipe's `loader` slot spins
 * (targeting the `svg` inside `data-slot="button-loader"`), so there are no per-part hook classes.
 */
function ButtonLoader(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

export const Button: Component<ButtonProps> = (props) => {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props
  // and these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with
  // `??` (never `merge`, which resolves by key *presence* — a wrapper forwarding an unset
  // `type`/`variant`/… would drop the default). See `useDefaults`' doc in @hope-ui/theming.
  const merged = useDefaults({
    recipe: "button",
    props,
    defaults: {
      type: "button" as const,
      nativeButton: true,
      variant: "default" as const,
      size: "md" as const,
      color: "primary" as const,
      loaderPlacement: "center" as const,
      loading: false,
      fullWidth: false,
    },
  });

  const isLoading = () => merged.loading;
  // `loadingText` keeps the label visible, so it implies an inline `start` loader rather than the
  // label-hiding `center` overlay.
  const effectivePlacement = (): ButtonLoaderPlacement =>
    merged.loadingText != null ? "start" : merged.loaderPlacement;

  // `useSlots` returns one ready-to-call class fn per slot, each folding the full override chain:
  // recipe base → preset `slotClasses` → instance `slotClasses` → `class` (root only). The themeable
  // props are read lazily on every slot-fn call, so variant/loading changes flow through. Behavioral
  // props (`nativeButton`/`type`) are threaded too so a preset `slotClasses` *function* can react to
  // them; the recipe reads only its declared variant keys and ignores the rest. Content factories
  // (`loader`/`loadingText`) are irrelevant to class computation, so they're deliberately not passed.
  const slots = useSlots({
    recipe: "button",
    themeableProps: () => ({
      variant: merged.variant,
      color: merged.color,
      size: merged.size,
      fullWidth: merged.fullWidth,
      // Layout only, and only while loading — the loader slot itself is mounted by `<Show>` below,
      // so an unset placement (not loading) applies nothing.
      loaderPlacement: isLoading() ? effectivePlacement() : undefined,
      nativeButton: merged.nativeButton,
      // `ButtonProps.type` (Solid's `ButtonHTMLAttributes`) is wider than `ButtonType`; narrow it the
      // same way the `createButton` call above does. The recipe ignores `type` anyway; it's threaded
      // only so a preset `slotClasses` function can read it.
      type: merged.type as ButtonType,
    }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

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
    "slotClasses",
    "children",
  );

  // Only the root goes through `renderElement` (it owns `render`/`as` polymorphism + ref merging).
  // The internal parts are always plain spans, so they're written as literal elements.
  const children = (
    <>
      <Show when={merged.startDecorator != null}>
        <span data-slot="button-start-decorator" class={slots.startDecorator()}>
          {merged.startDecorator}
        </span>
      </Show>
      <span data-slot="button-label" class={slots.label()}>
        {isLoading() && merged.loadingText != null
          ? runIfFunction(merged.loadingText)
          : merged.children}
      </span>
      <Show when={merged.endDecorator != null}>
        <span data-slot="button-end-decorator" class={slots.endDecorator()}>
          {merged.endDecorator}
        </span>
      </Show>
      <Show when={isLoading()}>
        <span data-slot="button-loader" class={slots.loader()} aria-hidden="true">
          {runIfFunction(merged.loader) ?? <ButtonLoader />}
        </span>
      </Show>
    </>
  );

  const elementProps = merge(rest, button.buttonProps, {
    get class(): string {
      // `useSlots` already folded the override chain into the root slot fn — recipe base → preset
      // `slotClasses` → instance `slotClasses` → `class` — with the final tailwind-merge inside the
      // recipe's `{ class }` seam, so a later utility wins a conflict without a separate `cn`.
      return slots.root();
    },
    // `aria-busy` is the accessible loading signal. Byte-stable: `loading` is the same value on the
    // server and initial client, so a non-loading button emits no `aria-busy` on either.
    get "aria-busy"(): "true" | undefined {
      return isLoading() ? "true" : undefined;
    },
    // `data-disabled` and `data-pressed` are emitted by `createButton` (in `button.buttonProps`),
    // so they're spread above — the component no longer hand-wires them here.
    // The root's own slot marker; parts use the `button-<part>` convention (a component-prefixed slot).
    "data-slot": "button",
    children,
  });

  return renderElement<ButtonElementProps, HTMLButtonElement>({
    as: "button",
    render: merged.render,
    props: elementProps as unknown as ButtonElementProps,
    ref: button.setRef,
  });
};
