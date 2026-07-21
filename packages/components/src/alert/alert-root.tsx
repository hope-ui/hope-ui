import { createControllableState, createPresence } from "@hope-ui/primitives/internal";
import { type RenderProp, renderElement } from "@hope-ui/primitives/render";
import { runIfFunction } from "@hope-ui/primitives/utils";
import type {
  AlertColorScheme,
  AlertSize,
  AlertStatusIconKey,
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
  merge,
  omit,
  Show,
  untrack,
} from "solid-js";
import { CloseTrigger } from "./alert-close-trigger";
import { Content } from "./alert-content";
import { AlertContext, type AlertContextValue } from "./alert-context";
import { Description } from "./alert-description";
import { Icon } from "./alert-icon";
import { BUILTIN_STATUS_ICONS, STATUS_ICON_KEYS } from "./alert-icons";
import { Title } from "./alert-title";

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
  /** Convenience: render an `Alert.CloseTrigger` dismiss button. Requires a `<ThemeProvider>` ancestor. */
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
   * `actions`, `closeTrigger`). Folded in after the recipe base and the preset's global `slotClasses`, before
   * `class` (root only). Use literal class strings so the consumer's Tailwind scanner can see them.
   */
  slotClasses?: SlotClasses<"alert">;
  /** The compound anatomy (`Alert.Icon`/`Alert.Content`/…). When set, the convenience props are ignored. */
  children?: JSX.Element;
}

/** `merged` after `useDefaults` — the five defaulted keys are now guaranteed present. */
type MergedAlertProps = AlertProps &
  Required<Pick<AlertProps, "variant" | "colorScheme" | "size" | "role" | "closable">>;

/**
 * The slice of the resolved (merged) Alert props {@link resolveStatusIcon} actually reads: the
 * per-instance `icon`, the `colorScheme` role (required — it indexes the status maps), and the four
 * preset status-icon factories. Kept a `Pick` of `MergedAlertProps` so it can't drift from the real
 * props while still declaring exactly what the function depends on.
 */
type StatusIconInput = Pick<MergedAlertProps, "icon" | "colorScheme" | AlertStatusIconKey>;

/**
 * instance `icon` ?? preset `{role}Icon` factory ?? built-in status glyph. `false` hides it. Pure and
 * module-scope: the caller wraps it in `children(() => resolveStatusIcon(merged))`, which memoizes the
 * *result*.
 */
function resolveStatusIcon(merged: StatusIconInput): JSX.Element | null {
  // Read the instance `icon` **exactly once**. It is a component-valued prop, so each read of the raw
  // getter re-runs `createComponent` (the `children()` multi-read hazard) — the caller's
  // `children(() => resolveStatusIcon(...))` memoizes the *result*, not this internal read. Binding it
  // to a local is the single-read fix the codified rule calls for ("a slot read exactly once needs
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
    // `merged[factoryKey]` is exactly `(() => JSX.Element) | undefined` now that the input is the
    // narrow `StatusIconInput` (the factory keys carry that value type), so no cast is needed.
    const factory = merged[factoryKey];
    if (factory != null) {
      return runIfFunction(factory) ?? null;
    }
  }
  const builtin = BUILTIN_STATUS_ICONS[merged.colorScheme];
  return builtin ? builtin() : null;
}

export const Root: Component<AlertProps> = (props) => {
  // `useDefaults` folds the preset's per-component `defaultProps` in between the instance props and
  // these built-in defaults (precedence: instance ?? preset ?? builtin), resolving each key with `??`.
  const merged = useDefaults({
    recipe: "alert",
    props,
    defaults: {
      variant: "default" as const,
      colorScheme: "primary" as const,
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
  // plain `<Alert>` renders. `setOpen` is what `Alert.CloseTrigger` calls; `onOpenChange` fires either way.
  const [open, setOpen] = createControllableState({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen ?? true,
    onChange: (value) => merged.onOpenChange?.(value),
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

  // The compound parts publish their ids here; `AlertBody` reads them back for `aria-*`. Registered
  // client-side via `createRegisteredId` (`onSettled`), so the links land after hydration for every
  // Alert — the auto-compose path reuses the same parts, so it registers the same way.
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

  // The rendered alert surface. A real component (not a `<Show>` render-callback), so its body runs
  // once, untracked — no `untrack`/`_present` hack. Declared inside `Root` so it closes over the
  // locals above (nothing is threaded through props), and rendered under `<Show>` under
  // `<AlertContext>` so `children(() => merged.children)` resolves in an owner UNDER the provider —
  // the consumer's compound parts see `useAlertContext()`.
  function AlertBody(): JSX.Element {
    // Compound (consumer `children`) vs auto-compose (convenience props): resolved once via
    // `children()`, so the body reads that resolved node without re-creating the parts.
    const resolvedChildren = children(() => merged.children);

    // Each convenience slot is read in a `<Show>` `when` gate AND its body below (a multi-read), so the
    // raw prop is resolved once with `children()` — which also fixes the `when`-gate hydration hazard (a
    // raw `when={x != null}` builds and discards a component whose `_hk` the client and server place
    // differently). See CLAUDE.md / __internal__/solid-2.0-notes.md ("children() decision procedure").
    const icon = children(() => resolveStatusIcon(merged));
    const title = children(() => merged.title);
    const description = children(() => merged.description);

    // One aria path for both compound and auto: the parts (`Alert.Title`/`Alert.Description`, reused by
    // `autoBody`) self-register their ids via `createRegisteredId` (`onSettled`, client-only), and a
    // consumer override always wins. The links land after hydration — never in the server HTML.
    const labelledBy = (): string | undefined => {
      const consumer = merged["aria-labelledby"];
      return typeof consumer === "string" ? consumer : registeredTitleId();
    };
    const describedBy = (): string | undefined => {
      const consumer = merged["aria-describedby"];
      return typeof consumer === "string" ? consumer : registeredDescriptionId();
    };

    // The auto-composed body, built from the real `Alert.*` parts — so the `data-slot` + slot-class
    // wiring (and the parts' id self-registration) lives in one place instead of being duplicated here.
    // No `id=` is passed; the parts generate and register their own. Built lazily (only when `children`
    // is absent), so a compound Alert pays for none of it.
    const autoBody = (): JSX.Element => (
      <>
        <Show when={icon() != null}>
          <Icon>{icon()}</Icon>
        </Show>
        <Show when={title() != null || description() != null}>
          <Content>
            <Show when={title() != null}>
              <Title>{title()}</Title>
            </Show>
            <Show when={description() != null}>
              <Description>{description()}</Description>
            </Show>
          </Content>
        </Show>
        <Show when={merged.closable}>
          <CloseTrigger />
        </Show>
      </>
    );

    const elementProps = merge(rest, {
      get class(): string {
        return slots.root();
      },
      "data-slot": "alert",
      get "data-presence"(): string {
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
  }

  return (
    <AlertContext value={context}>
      <Show when={presence.mounted()}>
        <AlertBody />
      </Show>
    </AlertContext>
  );
};

// Re-export the recipe vocabulary so consumers can import it from the component's subpath (the barrel
// re-exports these from here).
export type { AlertColorScheme, AlertSize, AlertVariant };
