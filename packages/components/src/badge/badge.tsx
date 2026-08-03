import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import type {
  BadgeColorScheme,
  BadgeShape,
  BadgeSize,
  BadgeThemeableProps,
  BadgeVariant,
  SlotClasses,
} from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { type Component, children, merge, omit, Show } from "solid-js";

// Re-exported so consumers get the variant vocabulary from the component's own subpath, without
// importing `@hope-ui/theming` directly.
export type { BadgeColorScheme, BadgeShape, BadgeSize, BadgeVariant };

// The role selector is named `colorScheme`, not `color`, so it does not shadow the native HTML
// `color` attribute — which stays untouched and is forwarded like any other native attribute.
type BadgeElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

// The native `<span>` props **plus** the themeable variants **plus** the per-instance props below.
// Extending the themeable props rather than re-declaring the variants keeps the two in lockstep by
// construction. Badge is a static label, so unlike Button it has no behavior surface at all — no
// `disabled`, no `loading` — just content and styling.
export interface BadgeProps extends BadgeElementProps, BadgeThemeableProps {
  /**
   * Renders as a different element/component while keeping Badge's computed props (e.g. an `<a>` for
   * a linkable tag). The only polymorphism mechanism (there is no `as` prop).
   */
  render?: RenderProp<BadgeElementProps>;
  /** Leading slot (typically an icon), before the label. */
  startDecorator?: JSX.Element;
  /** Trailing slot (typically an icon), after the label. */
  endDecorator?: JSX.Element;
  /** Merged over the recipe's root class (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * Per-instance class overrides, keyed by slot (`root`, `label`, `startDecorator`, `endDecorator`,
   * `dot`). Applied after the recipe base and the preset's global `slotClasses`, and before `class`
   * — the later utility wins a Tailwind conflict. Write them as literal class strings, or the
   * consumer's Tailwind scanner will not see them.
   */
  slotClasses?: SlotClasses<"badge">;
  /** The badge label. */
  children?: JSX.Element;
}

export const Badge: Component<BadgeProps> = (props) => {
  // Precedence: instance prop ?? the preset's `defaultProps` ?? the builtins below, each key
  // resolved with `??`. Never Solid's `merge`, which resolves by key *presence* and so lets an
  // explicitly-`undefined` prop beat the default.
  const merged = useDefaults({
    recipe: "badge",
    props,
    defaults: {
      variant: "soft" as const,
      colorScheme: "primary" as const,
      size: "sm" as const,
      shape: "rounded" as const,
      fullWidth: false,
    },
  });

  // One class function per slot, each folding in the whole override chain: recipe base → preset
  // `slotClasses` → instance `slotClasses` → `class` (root only). The variants are read lazily on
  // every call, so changing one flows straight through.
  const slots = useSlots({
    recipe: "badge",
    variantsProps: () => ({
      variant: merged.variant,
      colorScheme: merged.colorScheme,
      size: merged.size,
      shape: merged.shape,
      fullWidth: merged.fullWidth,
    }),
    slotClasses: () => merged.slotClasses,
  });

  const rest = omit(
    merged,
    "render",
    "variant",
    "colorScheme",
    "size",
    "shape",
    "fullWidth",
    "startDecorator",
    "endDecorator",
    "class",
    "slotClasses",
    "children",
  );

  // Each of these is read twice below — once in a `<Show>`'s `when` gate, once in its body — and a
  // JSX-valued prop compiles to a lazy getter that runs `createComponent` on *every* read. Resolving
  // each once with `children()` means both read sites share one node instead of building two.
  //
  // The gate read is also a hydration hazard: `when={merged.startDecorator != null}` builds a
  // component and throws it away, which shifts where the client thinks the next node is relative to
  // the server HTML. Gating on the resolved accessor removes that phantom build. Note Badge gates
  // its label too, unlike Button, so the label needs the same treatment.
  const startDecorator = children(() => merged.startDecorator);
  const label = children(() => merged.children);
  const endDecorator = children(() => merged.endDecorator);

  // Only the root goes through `renderElement`, which is what implements the `render` prop and merges
  // refs. The inner parts are always plain spans, so they are written as literal elements, and each
  // is gated so an empty slot contributes no node at all.
  const content = (
    <>
      <Show when={merged.variant === "dot"}>
        <span data-slot="badge-dot" class={slots.dot()} aria-hidden="true" />
      </Show>
      <Show when={startDecorator() != null}>
        <span data-slot="badge-start-decorator" class={slots.startDecorator()}>
          {startDecorator()}
        </span>
      </Show>
      <Show when={label() != null}>
        <span data-slot="badge-label" class={slots.label()}>
          {label()}
        </span>
      </Show>
      <Show when={endDecorator() != null}>
        <span data-slot="badge-end-decorator" class={slots.endDecorator()}>
          {endDecorator()}
        </span>
      </Show>
    </>
  );

  const elementProps = merge(rest, {
    get class(): string {
      // The consumer's class is passed *into* the slot function, never concatenated after it: only
      // then does tailwind-merge see both strings and let the consumer's utility win a conflict.
      return slots.root(merged.class);
    },
    // The root's own marker; the inner parts use the `badge-<part>` convention.
    "data-slot": "badge",
    children: content,
  });

  return renderElement<BadgeElementProps, HTMLSpanElement>({
    as: "span",
    render: merged.render,
    props: elementProps as unknown as BadgeElementProps,
  });
};
