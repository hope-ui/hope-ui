import { createControllableState, createPresence } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement, runIfFunction } from "@hope-ui/primitives/utils";
import type {
  AlertColorScheme,
  AlertSize,
  AlertThemeableProps,
  AlertVariant,
  SlotClasses,
} from "@hope-ui/theming";
import { useDefaults, useSlots } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import {
  type Component,
  children,
  createEffect,
  createSignal,
  createUniqueId,
  merge,
  omit,
  Show,
  untrack,
} from "solid-js";
import { Close } from "./alert-close";
import { AlertContext, type AlertContextValue } from "./alert-context";
import { BUILTIN_STATUS_ICONS, STATUS_ICON_KEYS } from "./alert-icons";

type AlertElementProps = JSX.HTMLAttributes<HTMLDivElement>;

/** The live-region politeness of the alert. `none` renders no `role` (a purely visual notice). */
export type AlertRole = "alert" | "status" | "none";

/**
 * `AlertProps` = the native `<div>` props **plus** the themeable surface (`AlertThemeableProps`: the
 * recipe variants + the four status-icon factories, owned by `@hope-ui/theming`) **plus** the
 * per-instance props below. Extending `AlertThemeableProps` keeps the two in lockstep by construction.
 *
 * `role` and `title` are `Omit`-ted from the native attributes and re-declared: `role` narrows to the
 * three live-region choices, and `title` is repurposed as a convenience content slot (a `JSX.Element`,
 * not the native tooltip string).
 */
export interface AlertProps extends Omit<AlertElementProps, "role" | "title">, AlertThemeableProps {
  /** Live-region politeness. `alert` (assertive), `status` (polite), or `none`. Default `alert`. */
  role?: AlertRole;
  /** Convenience: the alert title. Auto-composed into `Alert.Title` when Root has no `children`. */
  title?: JSX.Element;
  /**
   * Convenience: the alert description. Auto-composed into `Alert.Description` when Root has no
   * `children`.
   */
  description?: JSX.Element;
  /**
   * Convenience: the leading glyph. `false` hides it; omitting it falls back to the preset's
   * `{role}Icon` default and then hope's built-in status glyph (info/success/warning/danger only).
   * Auto-composed into the `alert-icon` slot when Root has no `children`.
   */
  icon?: JSX.Element | false;
  /** Convenience: render an `Alert.Close` dismiss button. Requires a `<ThemeProvider>` ancestor. */
  closable?: boolean;
  /** Controlled open state. Uncontrolled defaults to `defaultOpen`. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default `true`. */
  defaultOpen?: boolean;
  /** Called whenever the open state should change (dismiss click, controlled or not). */
  onOpenChange?: (open: boolean) => void;
  /** Fires after the exit transition finishes and the alert has unmounted (Ant's `afterClose`). */
  onExitComplete?: () => void;
  /**
   * Renders as a different element/component while keeping Alert's computed props. The only
   * polymorphism mechanism (there is no `as` prop).
   */
  render?: RenderProp<AlertElementProps>;
  /** Merged over the recipe's root class (applied last), so the consumer's utilities win. */
  class?: string;
  /**
   * Per-instance class overrides, keyed by slot (`root`, `icon`, `content`, `title`, `description`,
   * `actions`, `close`). Folded in after the recipe base and the preset's global `slotClasses`, before
   * `class` (root only). Use literal class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"alert">;
  /** The compound anatomy (`Alert.Icon`/`Alert.Content`/…). When set, the convenience props are ignored. */
  children?: JSX.Element;
}

export const Root: Component<AlertProps> = (props) => {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  const merged = useDefaults({
    recipe: "alert",
    props,
    defaults: {
      variant: "default" as const,
      colorScheme: "neutral" as const,
      size: "md" as const,
      role: "alert" as const,
      closable: false,
    },
  });

  const slots = useSlots({
    recipe: "alert",
    variantsProps: () => ({
      variant: merged.variant,
      colorScheme: merged.colorScheme,
      size: merged.size,
    }),
    slotClasses: () => merged.slotClasses,
    class: () => merged.class,
  });

  // Controlled/uncontrolled open state → presence-driven mount. `defaultOpen` defaults to `true`, so a
  // plain `<Alert>` renders. `setOpen` is what `Alert.Close` calls; `onOpenChange` fires either way.
  const [open, setOpen] = createControllableState({
    value: () => props.open,
    defaultValue: () => props.defaultOpen ?? true,
    onChange: (value) => props.onOpenChange?.(value),
  });

  // A signal-backed root ref feeds both `renderElement`'s ref merge and `createPresence` (which reads
  // it on the exit edge to detect an authored CSS transition). `initialEnter: false` so a
  // default-open alert paints in its final state without a spurious first-frame transition.
  const [rootEl, setRootEl] = createSignal<HTMLElement | null>(null);
  const presence = createPresence({
    present: open,
    ref: rootEl,
    initialEnter: false,
  });

  // Fire `onExitComplete` on the mounted true→false edge (after the exit transition, once unmounted).
  // A tracked `createEffect` (not a JSX-embedded call) — the `<Show>` unmounts its children on that
  // exact edge, so a child expression would never observe it. `untrack` seeds the latch so the effect's
  // own initial run (which fires for the seed value too) can't mistake mount for an exit.
  let previouslyMounted = untrack(presence.mounted);
  createEffect(
    () => presence.mounted(),
    (isMounted) => {
      if (previouslyMounted && !isMounted) {
        merged.onExitComplete?.();
      }
      previouslyMounted = isMounted;
    },
  );

  /** instance `icon` ?? preset `{role}Icon` factory ?? built-in status glyph. `false` hides it. */
  function resolveIcon(): JSX.Element | null {
    // Read the instance `icon` **exactly once**. It is a component-valued prop, so each read of the
    // raw getter re-runs `createComponent` (the `children()` multi-read hazard) — the outer
    // `children(() => resolveIcon())` memoizes the *result*, not these internal reads. Binding it to a
    // local is the single-read fix the codified rule calls for ("a slot read exactly once needs
    // nothing"); a consumer `icon={<MyIcon/>}` is then built once, not three times.
    const instanceIcon = merged.icon;
    if (instanceIcon === false) {
      return null;
    }
    if (instanceIcon != null) {
      return instanceIcon;
    }
    const factoryKey = STATUS_ICON_KEYS[merged.colorScheme];
    if (factoryKey) {
      const factory = merged[factoryKey] as (() => JSX.Element) | undefined;
      if (factory != null) {
        return runIfFunction(factory) ?? null;
      }
    }
    const builtin = BUILTIN_STATUS_ICONS[merged.colorScheme];
    return builtin ? builtin() : null;
  }

  // Auto-compose ids: generated here (SSR-stable via `createUniqueId`) and written directly onto both
  // the title/description hosts and the root's `aria-*` — so the link is present in the server HTML
  // (unlike the compound path's `createRegisteredId`, which is client-only after `onSettled`).
  const autoTitleId = createUniqueId();
  const autoDescriptionId = createUniqueId();

  // The compound parts publish their ids here; Root reads them for `aria-*` in the compound path.
  const [registeredTitleId, setRegisteredTitleId] = createSignal<string | undefined>(undefined);
  const [registeredDescriptionId, setRegisteredDescriptionId] = createSignal<string | undefined>(
    undefined,
  );

  const context: AlertContextValue = {
    slots,
    setOpen,
    registerTitleId: setRegisteredTitleId,
    registerDescriptionId: setRegisteredDescriptionId,
  };

  const rest = omit(
    merged,
    "render",
    "variant",
    "colorScheme",
    "size",
    "role",
    "closable",
    "title",
    "description",
    "icon",
    "infoIcon",
    "successIcon",
    "warningIcon",
    "dangerIcon",
    "open",
    "defaultOpen",
    "onOpenChange",
    "onExitComplete",
    "class",
    "slotClasses",
    "children",
    "aria-labelledby",
    "aria-describedby",
  );

  // The alert surface, rendered as a child of the context provider (below). *This* is where the
  // consumer's compound parts are created, so their `useAlertContext()` resolves: `children(() =>
  // merged.children)` computes eagerly on creation, so it has to run in the provider's owner — never in
  // Root's own (context-less) body. Splitting it into its own component is what places that owner.
  const AlertSurface: Component = () => {
    // Compound (consumer `children`) vs auto-compose (convenience props): resolved once via
    // `children()`, so `composed()` (used for aria linking) re-reads the memo without re-creating the
    // parts, and the body reads that same resolved node.
    const resolvedChildren = children(() => merged.children);
    const composed = (): boolean => resolvedChildren() != null;

    // Each convenience slot is read in a `<Show>` `when` gate AND its body below (a multi-read), so the
    // raw prop is resolved once with `children()` — which also fixes the `when`-gate hydration hazard
    // (a raw `when={x != null}` builds and discards a component whose `_hk` the client and server place
    // differently). See CLAUDE.md / docs/solid-2.0-notes.md ("children() decision procedure").
    const icon = children(() => resolveIcon());
    const title = children(() => merged.title);
    const description = children(() => merged.description);

    const labelledBy = (): string | undefined => {
      const consumer = props["aria-labelledby"];
      if (typeof consumer === "string") {
        return consumer;
      }
      return composed() ? registeredTitleId() : title() != null ? autoTitleId : undefined;
    };
    const describedBy = (): string | undefined => {
      const consumer = props["aria-describedby"];
      if (typeof consumer === "string") {
        return consumer;
      }
      return composed()
        ? registeredDescriptionId()
        : description() != null
          ? autoDescriptionId
          : undefined;
    };

    // The auto-composed body — literal host-element wrappers, mirroring Badge: the keyed root's first
    // DOM child is always a host node (a `<span>`/`<div>`), never a bare component, and the glyph (a
    // component) sits INSIDE the host `alert-icon` span (the `solid2-first-child-component-hydration`
    // hazard). Built lazily (only when `children` is absent), so a compound Alert pays for none of it.
    const autoBody = (): JSX.Element => (
      <>
        <Show when={icon() != null}>
          <span data-slot="alert-icon" class={slots.icon()} aria-hidden="true">
            {icon()}
          </span>
        </Show>
        <Show when={title() != null || description() != null}>
          <div data-slot="alert-content" class={slots.content()}>
            <Show when={title() != null}>
              <div data-slot="alert-title" id={autoTitleId} class={slots.title()}>
                {title()}
              </div>
            </Show>
            <Show when={description() != null}>
              <div data-slot="alert-description" id={autoDescriptionId} class={slots.description()}>
                {description()}
              </div>
            </Show>
          </div>
        </Show>
        <Show when={merged.closable}>
          <Close />
        </Show>
      </>
    );

    const elementProps = merge(rest, {
      get class(): string {
        return slots.root();
      },
      "data-slot": "alert",
      get "data-state"(): string {
        return presence.status();
      },
      get role(): AlertRole | undefined {
        return merged.role === "none" ? undefined : merged.role;
      },
      get "aria-labelledby"(): string | undefined {
        return labelledBy();
      },
      get "aria-describedby"(): string | undefined {
        return describedBy();
      },
      get children(): JSX.Element {
        return resolvedChildren() ?? autoBody();
      },
    });

    return renderElement<AlertElementProps, HTMLDivElement>({
      as: "div",
      render: merged.render,
      props: elementProps as unknown as AlertElementProps,
      ref: setRootEl,
    });
  };

  return (
    <AlertContext value={context}>
      <Show when={presence.mounted()}>
        <AlertSurface />
      </Show>
    </AlertContext>
  );
};

// Re-export the recipe vocabulary so consumers can import it from the component's subpath (the barrel
// re-exports these from here).
export type { AlertColorScheme, AlertSize, AlertVariant };
