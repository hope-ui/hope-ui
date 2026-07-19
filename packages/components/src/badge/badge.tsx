import { type RenderProp, renderElement } from "@hope-ui/primitives/utils";
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

// The recipe contract (variant vocabulary + slots) is owned by `@hope-ui/theming` — the component
// consumes it via `useRecipe`, never declares it (no module augmentation). Re-export the vocabulary
// so consumers can still import it from the component's subpath.
export type { BadgeColorScheme, BadgeShape, BadgeSize, BadgeVariant };

// The role selector is `colorScheme`, **not** `color`: a `color` prop would shadow the native HTML
// `color` attribute. With the rename, native `color` is left untouched and forwarded through `...rest`.
type BadgeElementProps = JSX.HTMLAttributes<HTMLSpanElement>;

// `BadgeProps` = the native `<span>` props **plus** the themeable surface (`BadgeThemeableProps`:
// the recipe variants, owned by `@hope-ui/theming`) **plus** the per-instance-only props below.
// Extending `BadgeThemeableProps` (rather than re-declaring the variants) keeps the two in lockstep
// by construction. Badge is a static label, so — unlike Button — there is no behavior surface (no
// `disabled`/`loading`/`nativeButton`), just content and styling channels.
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
   * `dot`). Folded in after the recipe base and the preset's global `slotClasses`, before `class`
   * (root only) — so a later utility wins a Tailwind conflict. Use literal class strings so the
   * consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"badge">;
  /** The badge label. */
  children?: JSX.Element;
}

export const Badge: Component<BadgeProps> = (props) => {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`
  // (never `merge`, which resolves by key *presence*). See `useDefaults`' doc in @hope-ui/theming.
  const merged = useDefaults({
    recipe: "badge",
    props,
    defaults: {
      variant: "soft" as const,
      colorScheme: "neutral" as const,
      size: "sm" as const,
      shape: "rounded" as const,
      fullWidth: false,
    },
  });

  // `useSlots` returns one ready-to-call class fn per slot, each folding the full override chain:
  // recipe base → preset `slotClasses` → instance `slotClasses` → `class` (root only). The variant
  // props are read lazily on every slot-fn call, so a variant change flows through. Badge is static,
  // so the variant props are the whole styling input.
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
    class: () => merged.class,
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

  // A slot whose content is a **component** (a consumer's `startDecorator={<Icon/>}` compiles to a
  // lazy getter that runs `createComponent` where the prop is read) must be created **eagerly**, in
  // the component body — never lazily inside a `<Show>`-gated slot span's reactive `insert`. A
  // component created lazily inside a `<Show>` computes a hydration key one off from the server's and
  // fails to hydrate (an upstream `@solidjs/web` beta asymmetry — see `docs/solid-2.0-notes.md`).
  // Solid's `children` helper resolves each slot's content once (eagerly, matching a direct child
  // element, which hydrates cleanly) and memoizes it. Each `<Show>` then gates on the **resolved**
  // accessor — the raw prop must be read only once (a second read, e.g. a `!= null` gate, would run
  // the consumer getter again and create a *second* component instance, which double-claims the
  // server node on hydrate). Unlike Button, Badge's label is `<Show>`-gated too, so it needs the same
  // treatment as the decorators. See docs/solid-2.0-notes.md.
  const startDecorator = children(() => merged.startDecorator);
  const label = children(() => merged.children);
  const endDecorator = children(() => merged.endDecorator);

  // Only the root goes through `renderElement` (it owns `render`/`as` polymorphism + ref merging).
  // The internal parts are always plain spans, so they're written as literal elements. The role dot
  // is rendered only for the `dot` variant and leads the content; the label/decorators are `<Show>`-
  // gated so an empty part contributes no node (keeping the tree minimal and hydration-stable).
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
      // `useSlots` already folded the override chain into the root slot fn — recipe base → preset
      // `slotClasses` → instance `slotClasses` → `class` — with the final tailwind-merge inside the
      // recipe's `{ class }` seam, so a later utility wins a conflict without a separate `cn`.
      return slots.root();
    },
    // The root's own slot marker; parts use the `badge-<part>` convention (a component-prefixed slot).
    "data-slot": "badge",
    children: content,
  });

  return renderElement<BadgeElementProps, HTMLSpanElement>({
    as: "span",
    render: merged.render,
    props: elementProps as unknown as BadgeElementProps,
  });
};
