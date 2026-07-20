import { type ButtonType, createButton } from "@hope-ui/primitives/internal";
import {
  composeEventHandlers,
  type RenderProp,
  renderElement,
  runIfFunction,
} from "@hope-ui/primitives/utils";
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

// The recipe contract (variant vocabulary + slots) is owned by `@hope-ui/theming` — the component
// consumes it via `useRecipe`, never declares it (no module augmentation). Re-export the vocabulary
// so consumers can still import it from the component's subpath. `ButtonLoaderPlacement` is shared
// by the recipe's `loaderPlacement` variant and this component's `loaderPlacement` prop.
export type { ButtonColorScheme, ButtonLoaderPlacement, ButtonSize, ButtonVariant };

// The role selector is `colorScheme`, **not** `color`: a `color` prop would shadow the native HTML
// `color` attribute. With the rename, native `color` is left untouched and forwarded through `...rest`.
type ButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

// `ButtonProps` = the native element props **plus** the themeable surface (`ButtonThemeableProps`:
// recipe variants + chrome content, owned by `@hope-ui/theming`) **plus** the per-instance-only props
// below. Extending `ButtonThemeableProps` (instead of re-declaring the variants) is what keeps the two
// in lockstep by construction — a themeable key is, by definition, also a component prop. The two
// chrome-content keys are the exception: the themeable surface narrows them to a **factory**
// (reuse-safe app-wide default), while a per-instance prop also accepts a bare `JSX.Element`, so they
// are `Omit`-ted here and re-declared wider below.
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
      colorScheme: "primary" as const,
      loaderPlacement: "center" as const,
      loading: false,
      fullWidth: false,
      iconOnly: false,
    },
  });

  // Dev-only accessibility guard: an icon-only button has no visible text, so it needs an
  // `aria-label` (or `aria-labelledby`) or it announces as an unnamed button. Client-only — a
  // `createEffect` never runs during SSR, so it never spams the server log; the check is pure-props
  // (no DOM ref needed). Deps are read in the tracking function, not the callback, to avoid
  // `STRICT_READ_UNTRACKED`. Mirrors the element/`nativeButton` mismatch warning in `createButton`.
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

  // Every slot whose content can be a **component** is resolved **once**, here in the component body,
  // through Solid's `children` helper — and every read site below uses the resolved accessor, never
  // the raw prop. The operative trigger is that each of these is read **more than once** in this
  // render; `children` memoizes the resolution so every accessor read returns the same node. That
  // buys two guarantees on that one axis:
  //   1. Single creation. A JSX-element prop getter re-runs `createComponent` on *every* read, so a
  //      prop read in more than one place — a `!= null` gate plus the render, or across a reactive
  //      re-run — would construct the component two or more times and discard the extras. This is why
  //      `loadingText` (read three ways: the loader-placement decision, the label gate, and the label
  //      render) and the `label` itself go through `children` too, not only the decorators.
  //   2. Hydration (the decorators specifically). A decorator is read in a `<Show>`'s `when` gate
  //      (`when={startDecorator() != null}`) AND in its body — the double read whose *gate* half is
  //      the hazard. A raw-prop `when` read builds and discards a component whose hydration key the
  //      client and server place differently (an upstream `@solidjs/web` beta asymmetry — see
  //      `__internal__/solid-2.0-notes.md`), so the body node mis-hydrates. Reading the **resolved** accessor
  //      in the gate removes the phantom build. (A single read inside a `<Show>` would be fine; it is
  //      the `when`+body pair that isn't.)
  const startDecorator = children(() => merged.startDecorator);
  const endDecorator = children(() => merged.endDecorator);
  const loader = children(() => runIfFunction(merged.loader) ?? <ButtonLoader />);
  const loadingText = children(() => runIfFunction(merged.loadingText));
  const label = children(() => merged.children);

  // `loadingText` keeps the label visible, so it implies an inline `start` loader rather than the
  // label-hiding `center` overlay.
  const loaderEffectivePlacement = (): ButtonLoaderPlacement =>
    loadingText() != null ? "start" : merged.loaderPlacement;

  // `useSlots` returns one ready-to-call class fn per slot, each folding the full override chain:
  // recipe base → preset `slotClasses` → instance `slotClasses` → `class` (root only). The variant
  // props are read lazily on every slot-fn call, so variant/loading changes flow through. Only the
  // recipe variants are passed — they're the sole styling axis both the recipe and a preset
  // `slotClasses` function read. Chrome content (`loader`/`loadingText`) isn't style, and runtime
  // state reaches the recipe through its `data-*`/`aria-*` variants, so neither is passed here.
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

  // Only the root goes through `renderElement` (it owns `render`/`as` polymorphism + ref merging).
  // The internal parts are always plain spans, so they're written as literal elements.
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
    children: content,
  });

  return renderElement<ButtonElementProps, HTMLButtonElement>({
    as: "button",
    render: merged.render,
    props: elementProps as unknown as ButtonElementProps,
    ref: button.setRef,
  });
};
