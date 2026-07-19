import { useLocale } from "@hope-ui/primitives/i18n";
import { type ButtonType, createButton } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement, runIfFunction } from "@hope-ui/primitives/utils";
import type { CloseButtonSize, CloseButtonThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";

// The recipe contract (variant vocabulary + slots) is owned by `@hope-ui/theming` — the component
// consumes it via `useRecipe`, never declares it (no module augmentation). Re-export the vocabulary
// so consumers can import it from the component's subpath.
export type { CloseButtonSize };

type CloseButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * `CloseButtonProps` = the native `<button>` props **plus** the themeable surface
 * (`CloseButtonThemeableProps`: the `size` variant + the glyph, owned by `@hope-ui/theming`) **plus**
 * the per-instance-only props below. Extending `CloseButtonThemeableProps` (rather than re-declaring
 * `size`) keeps the two in lockstep by construction. The one exception is `icon`: the themeable
 * surface narrows it to a **factory** (reuse-safe app-wide default), while a per-instance prop also
 * accepts a bare `JSX.Element`, so it is `Omit`-ted here and re-declared wider below.
 *
 * CloseButton is an **always-icon-only** button that is deliberately **surface-adaptive rather than
 * colored** — no `variant`/`colorScheme`, no `loading`, no decorators. The glyph inherits
 * `currentColor` and the hover/press wash + focus ring derive from it (see the `closeButton` recipe),
 * so it reads correctly on any surface with zero configuration.
 */
export interface CloseButtonProps
  extends CloseButtonElementProps,
    Omit<CloseButtonThemeableProps, "icon"> {
  /**
   * The glyph. Defaults to hope's built-in X. Accepts a bare element (per-instance) or a factory
   * `() => JSX.Element` — the factory form is what a preset supplies as an app-wide `defaultProps.icon`
   * (reuse-safe; a single shared node would *move* between instances), resolved via `runIfFunction`.
   */
  icon?: JSX.Element | (() => JSX.Element);
  /**
   * Renders as a different element/component while keeping CloseButton's computed props (e.g. an
   * `<a>`). The only polymorphism mechanism (there is no `as` prop).
   */
  render?: RenderProp<CloseButtonElementProps>;
  /**
   * Set `false` when `render`-ing a non-`<button>` element (an `<a>`, a `<div>`). It switches the
   * accessibility model to `role="button"` + `tabIndex` + `aria-disabled` and synthesizes keyboard
   * activation. Default `true`. Per-usage, so it is **not** a themeable app-wide default.
   */
  nativeButton?: boolean;
  /**
   * Disables the button. A native button uses the `disabled` attribute; a non-native element uses
   * `aria-disabled` and blocked handlers. Dimmed via the `opacity-disabled` token.
   */
  disabled?: boolean;
  /** Merged over the recipe's root class (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * Per-instance class overrides, keyed by slot (`root`, `icon`). Folded in after the recipe base and
   * the preset's global `slotClasses`, before `class` (root only) — so a later utility wins a Tailwind
   * conflict. Use literal class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"closeButton">;
}

/**
 * hope's default close glyph — Lucide's `x`. Hand-inlined (hope ships no icon-library dependency),
 * `stroke="currentColor"` so it adopts the surface color; the recipe's `icon` slot sizes it per `size`.
 */
function CloseIcon(): JSX.Element {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export const CloseButton: Component<CloseButtonProps> = (props) => {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`
  // (never `merge`, which resolves by key *presence*). See `useDefaults`' doc in @hope-ui/theming.
  const merged = useDefaults({
    recipe: "closeButton",
    props,
    defaults: {
      size: "sm" as const,
      nativeButton: true,
    },
  });

  // The localized default accessible name. `useLocale` has a default context, so this works without an
  // `I18nProvider` (falls back to the default locale/catalog). A consumer `aria-label` wins (below).
  const i18n = useLocale();

  // `useSlots` returns one ready-to-call class fn per slot, each folding the full override chain:
  // recipe base → preset `slotClasses` → instance `slotClasses` → `class` (root only). `size` is the
  // whole styling axis; passing the **complete** variant set every call is what `CompleteVariantsOf`
  // requires (an omitted variant would silently fall back to the recipe's `defaultVariants`).
  const slots = useSlots({
    recipe: "closeButton",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  // `createButton` owns the element-aware a11y props, disabled-gating, and the press engine. `type` is
  // forced to `"button"` (a close button must never submit a form). `preventFocusOnPress` keeps the
  // focus ring keyboard-only (a scripted focus-on-press would make `:focus-visible` match a click too).
  const button = createButton<HTMLButtonElement>({
    disabled: () => merged.disabled ?? false,
    nativeButton: () => merged.nativeButton,
    type: (): ButtonType => "button",
    preventFocusOnPress: () => true,
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
    "size",
    "icon",
    "class",
    "slotClasses",
    "children",
  );

  // The glyph is a **component** (the built-in `<CloseIcon/>` or a consumer `icon={<MyIcon/>}`/factory),
  // rendered **once, unconditionally** — there is always exactly one glyph and no `<Show>` — and
  // `merged.icon` is read **exactly once** here. Per the codified `children()` decision procedure
  // (CLAUDE.md / docs/solid-2.0-notes.md), the trigger is a component-valued prop read *more than
  // once*; a single read needs nothing (and a lone read wouldn't hit the hydration case even inside
  // a `<Show>` — that is the `when`+body double read). So `children()` is deliberately NOT used — it
  // would only add a memo and shift `_hk`.
  //
  // First-child safety: the glyph is wrapped in a host `<span>`, so the hydration-keyed `<button>`'s
  // first child is always a host element, never the component (the `solid2-first-child-component-
  // hydration` hazard). The `class` binding stays reactive, so a `size` change reflows the glyph size.
  const content = (
    <span data-slot="close-button-icon" class={slots.icon()}>
      {runIfFunction(merged.icon) ?? <CloseIcon />}
    </span>
  );

  // No dev a11y guard (unlike Button's icon-only warning): CloseButton always has a default
  // `aria-label`, so it can never be nameless.
  const elementProps = merge(rest, button.buttonProps, {
    get class(): string {
      // `useSlots` already folded the override chain into the root slot fn — recipe base → preset
      // `slotClasses` → instance `slotClasses` → `class` — with the final tailwind-merge inside the
      // recipe's `{ class }` seam, so a later utility wins a conflict without a separate `cn`.
      return slots.root();
    },
    get "aria-label"() {
      // The consumer's `aria-label` (or `aria-labelledby`, which wins at the ARIA level) takes
      // precedence; otherwise fall back to the localized `common.close`. Mirrors `createDialogClose`.
      return merged["aria-label"] ?? i18n.t("common.close");
    },
    // The root's own slot marker; the glyph wrapper uses the `close-button-<part>` convention.
    "data-slot": "close-button",
    children: content,
  });

  return renderElement<CloseButtonElementProps, HTMLButtonElement>({
    as: "button",
    render: merged.render,
    props: elementProps as unknown as CloseButtonElementProps,
    ref: button.setRef,
  });
};
