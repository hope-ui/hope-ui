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
 * The native `<div>` props **plus** the themeable surface (the styling variants and the four
 * status-icon factories) **plus** the per-instance props below. Extending the themeable props rather
 * than re-declaring the variants keeps the two in lockstep by construction.
 *
 * `role` and `title` are re-declared rather than inherited: `role` narrows to the three live-region
 * choices, and `title` is repurposed as a content slot taking a `JSX.Element`, not the native
 * tooltip string.
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
  /** Fires after the exit transition finishes and the alert has unmounted. */
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
   * `actions`, `closeTrigger`). Applied after the recipe base and the preset's global `slotClasses`,
   * and before `class`. Write them as literal class strings, or the consumer's Tailwind scanner will
   * not see them.
   */
  slotClasses?: SlotClasses<"alert">;
  /** The compound anatomy (`Alert.Icon`/`Alert.Content`/…). When set, the convenience props are ignored. */
  children?: JSX.Element;
}

/** `merged` after `useDefaults` — the five defaulted keys are now guaranteed present. */
type MergedAlertProps = AlertProps &
  Required<Pick<AlertProps, "variant" | "colorScheme" | "size" | "role" | "closable">>;

/**
 * Exactly the props {@link resolveStatusIcon} reads. Kept as a `Pick` of the merged props so it
 * cannot drift from them, while still declaring the function's real dependencies.
 */
type StatusIconInput = Pick<MergedAlertProps, "icon" | "colorScheme" | AlertStatusIconKey>;

/** instance `icon` ?? the preset's `{role}Icon` factory ?? the built-in glyph. `false` hides it. */
function resolveStatusIcon(merged: StatusIconInput): JSX.Element | null {
  // Bound to a local so the prop is read exactly *once*: it can hold a component, and each read of
  // the lazy getter re-runs `createComponent`. The caller's `children()` memoizes this function's
  // result, not the reads inside it, so without the local a consumer icon would be built three times.
  const instanceIcon = merged.icon;
  if (instanceIcon === false) {
    return null;
  }
  if (instanceIcon != null) {
    return instanceIcon;
  }
  const factoryKey = STATUS_ICON_KEYS[merged.colorScheme];
  if (factoryKey) {
    const factory = merged[factoryKey];
    if (factory != null) {
      return runIfFunction(factory) ?? null;
    }
  }
  const builtin = BUILTIN_STATUS_ICONS[merged.colorScheme];
  return builtin ? builtin() : null;
}

export const Root: Component<AlertProps> = (props) => {
  // Precedence: instance prop ?? the preset's `defaultProps` ?? the builtins below, each key
  // resolved with `??`.
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
  });

  // `defaultOpen` falls back to `true`, so a plain `<Alert>` with no open props renders. `setOpen` is
  // what `Alert.CloseTrigger` calls; `onOpenChange` fires whether or not the state is controlled.
  const [open, setOpen] = createControllableState({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen ?? true,
    onChange: (value) => merged.onOpenChange?.(value),
  });

  // A *signal*-backed ref, not a plain variable: `createPresence` reads the element on the exit edge
  // to detect whether the consumer authored a CSS transition, and it has to react when the element
  // appears. `initialEnter: false` so a default-open alert paints in its final state rather than
  // animating in on the first frame.
  const [rootEl, setRootEl] = createSignal<HTMLElement | null>(null);
  const presence = createPresence({
    present: open,
    ref: rootEl,
    initialEnter: false,
  });

  // Fires on the mounted true→false edge, once the exit transition has finished. It has to live in
  // an effect rather than anywhere in the JSX: the `<Show>` below unmounts its children on that
  // exact edge, so nothing inside it could ever observe the transition. The latch is seeded with
  // `untrack` (a read that registers no dependency) so the effect's own first run — which fires for
  // the seed value too — cannot mistake the initial mount for an exit.
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

  // The title/description parts publish their generated ids here, and `AlertBody` reads them back
  // for `aria-labelledby`/`aria-describedby`. Registration happens after the render pass and so only
  // on the client — the links are absent from the server HTML and appear once hydrated.
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

  // A real component rather than a `<Show>` render-callback, so its body runs once and untracked.
  // It is declared *inside* `Root` so it closes over the locals above with nothing threaded through
  // props, and rendered under the provider below — which is the point: `children()` must resolve the
  // consumer's compound parts in a scope where `useAlertContext()` can find the provider. Resolving
  // them in `Root`'s own body would put them above it, and every part would throw.
  function AlertBody(): JSX.Element {
    // Resolved once so the body can read the same node without rebuilding the consumer's parts.
    const resolvedChildren = children(() => merged.children);

    // Each of these is read twice below — once in a `<Show>`'s `when` gate, once in its body — and a
    // JSX-valued prop compiles to a lazy getter that runs `createComponent` on every read. Resolving
    // each once also removes a hydration hazard: a raw `when={prop != null}` builds a component and
    // throws it away, shifting where the client thinks the next node is.
    const icon = children(() => resolveStatusIcon(merged));
    const title = children(() => merged.title);
    const description = children(() => merged.description);

    // One path for both the compound and auto-composed forms, because both render the same parts. A
    // consumer's own value always wins; otherwise fall back to whatever the parts registered.
    const labelledBy = (): string | undefined => {
      const consumer = merged["aria-labelledby"];
      return typeof consumer === "string" ? consumer : registeredTitleId();
    };
    const describedBy = (): string | undefined => {
      const consumer = merged["aria-describedby"];
      return typeof consumer === "string" ? consumer : registeredDescriptionId();
    };

    // Built from the real `Alert.*` parts, so the slot markers, classes and id registration all live
    // in one place rather than being duplicated here. A function, not a value, so a compound Alert —
    // which never reaches it — pays nothing.
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
        return slots.root(merged.class);
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

// Re-exported so consumers get the variant vocabulary from the component's own subpath, without
// importing `@hope-ui/theming` directly.
export type { AlertColorScheme, AlertSize, AlertVariant };
