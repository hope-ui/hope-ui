import { useLocale } from "@hope-ui/i18n";
import { type ButtonType, createButton } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type { CloseButtonSize, CloseButtonThemeableProps, SlotClasses } from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, merge, omit } from "solid-js";
import { XIcon } from "../icons";

// Re-exported so consumers get the size vocabulary from the component's own subpath, without
// importing `@hope-ui/theming` directly.
export type { CloseButtonSize };

type CloseButtonElementProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * The native `<button>` props **plus** the themeable surface (`size` and the glyph) **plus** the
 * per-instance props below. `icon` is the one key re-declared wider: as an app-wide default it must
 * be a factory (a single shared element would *move* between instances), but per instance a bare
 * element is fine.
 *
 * CloseButton is always icon-only, and deliberately has no `variant` or `colorScheme`. The glyph
 * inherits `currentColor` and its hover wash and focus ring are derived from it, so one component
 * reads correctly on any surface with no configuration at all.
 */
export interface CloseButtonProps
  extends CloseButtonElementProps,
    Omit<CloseButtonThemeableProps, "icon"> {
  /**
   * The glyph, defaulting to the built-in X. Pass a bare element per instance; a preset's app-wide
   * default must be a factory, so every button builds its own node instead of sharing (and moving)
   * one.
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
   * Per-instance class overrides, keyed by slot (`root`, `icon`). Applied after the recipe base and
   * the preset's global `slotClasses`, and before `class` — the later utility wins a Tailwind
   * conflict. Write them as literal class strings, or the consumer's Tailwind scanner will not see
   * them.
   */
  slotClasses?: SlotClasses<"closeButton">;
}

export const CloseButton: Component<CloseButtonProps> = (props) => {
  // Precedence: instance prop ?? the preset's `defaultProps` ?? the builtins below, each key
  // resolved with `??`. Never Solid's `merge`, which resolves by key *presence* and so lets an
  // explicitly-`undefined` prop beat the default.
  const merged = useDefaults({
    recipe: "closeButton",
    props,
    defaults: {
      size: "sm" as const,
      nativeButton: true,
    },
  });

  // For the localized default accessible name. There is a default locale context, so this works
  // with no `I18nProvider` in the tree; a consumer `aria-label` still wins (see below).
  const i18n = useLocale();

  // One class function per slot, each folding in the whole override chain: recipe base → preset
  // `slotClasses` → instance `slotClasses` → `class` (root only). The *complete* variant set has to
  // be passed on every call — an omitted variant silently falls back to the recipe's own default.
  const slots = useSlots({
    recipe: "closeButton",
    variantsProps: () => ({ size: merged.size }),
    slotClasses: () => merged.slotClasses,
  });

  // `createButton` owns the element-aware ARIA, the disabled gating and the press handling. `type` is
  // forced to `"button"` so a close button can never submit a surrounding form.
  // `preventFocusOnPress` keeps the focus ring keyboard-only: a scripted `.focus()` during
  // pointer-down would make `:focus-visible` match a plain mouse click too.
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

  // `children()` is deliberately NOT used here, unlike in Button and Badge. It is only needed when a
  // component-valued prop is read more than once in a render, because each read of the lazy getter
  // re-runs `createComponent`. There is always exactly one glyph, rendered unconditionally, and
  // `merged.icon` is read exactly once — so a memo would buy nothing and only add a tree position.
  //
  // The glyph is wrapped in a host `<span>` so the `<button>`'s first child is always a plain
  // element rather than a component, which is what keeps it hydratable.
  const content = (
    <span data-slot="close-button-icon" class={slots.icon()}>
      {runIfFunction(merged.icon) ?? <XIcon />}
    </span>
  );

  // No icon-only accessibility warning here, unlike Button: this component always supplies a default
  // `aria-label`, so it can never end up nameless.
  const elementProps = merge(rest, button.buttonProps, {
    get class(): string {
      // The consumer's class is passed *into* the slot function, never concatenated after it: only
      // then does tailwind-merge see both strings and let the consumer's utility win a conflict.
      return slots.root(merged.class);
    },
    get "aria-label"() {
      // Read off the merged props, so a preset-level default also wins over the localized fallback.
      // A consumer `aria-labelledby` beats both at the ARIA level.
      return merged["aria-label"] ?? i18n.t("common.close");
    },
    // The root's own marker; the glyph wrapper uses the `close-button-<part>` convention. A wrapping
    // component (`Dialog.CloseTrigger`, `Alert.CloseTrigger`) may re-scope it to its own value.
    get "data-slot"() {
      return (merged as { "data-slot"?: string })["data-slot"] ?? "close-button";
    },
    children: content,
  });

  return renderElement<CloseButtonElementProps, HTMLButtonElement>({
    as: "button",
    render: merged.render,
    props: elementProps as unknown as CloseButtonElementProps,
    ref: button.setRef,
  });
};
