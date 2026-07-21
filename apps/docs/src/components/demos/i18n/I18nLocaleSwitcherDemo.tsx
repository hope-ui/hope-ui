import { Button } from "@hope-ui/components/button";
import { CloseButton } from "@hope-ui/components/close-button";
import { I18nProvider, useLocale } from "@hope-ui/i18n";
import { createSignal, For } from "solid-js";

// Live demo for the "See it work" section.
//
// A locale switcher wrapping real hope-ui components in an `<I18nProvider locale={…}>`. Everything
// inside reacts to the chosen locale: the CloseButton's built-in accessible name is translated, the
// container's reading `direction` flips (so the close affordance moves to the leading edge in RTL),
// and the readout shows the exact values `useLocale()` hands any descendant. This is the whole
// end-user setup — one provider, a reactive `locale` prop, no `setLocale`.
const LOCALES: { tag: string; label: string }[] = [
  { tag: "en-US", label: "English" },
  { tag: "fr-FR", label: "Français" },
  { tag: "ar-EG", label: "العربية" },
];

// The subtree that consumes the context. `useLocale()` returns reactive accessors, so reading
// `t`/`direction`/`locale` in JSX re-runs on every switch — no wiring beyond calling the hook.
function LocalizedSurface() {
  const i18n = useLocale();

  return (
    <div class="flex w-full max-w-md flex-col gap-3">
      {/* The card's own copy is app content — hope-ui does not translate that. What it localizes is
          component chrome: the CloseButton below renders with no aria-label, so it adopts the
          translated `common.close` accessible name for the active locale. `dir` flips the layout. */}
      <div
        dir={i18n.direction()}
        class="flex items-start gap-3 rounded-lg border border-subtle bg-surface-raised p-4 text-foreground shadow-sm"
      >
        <div class="flex-1">
          <p class="text-sm font-medium">Changes saved</p>
          <p class="text-sm text-foreground-muted">Your preferences were updated.</p>
        </div>
        <CloseButton size="sm" />
      </div>

      {/* A readout of exactly what any descendant gets from useLocale() for the active locale. */}
      <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-surface-sunken p-3 text-sm">
        <dt class="font-medium text-foreground-subtle">locale</dt>
        <dd class="font-mono text-foreground">{i18n.locale()}</dd>
        <dt class="font-medium text-foreground-subtle">direction</dt>
        <dd class="font-mono text-foreground">{i18n.direction()}</dd>
        <dt class="font-medium text-foreground-subtle">CloseButton name</dt>
        <dd class="text-foreground">
          «<span class="font-medium text-primary-emphasis">{i18n.t("common.close")}</span>»
        </dd>
      </dl>
    </div>
  );
}

export function I18nLocaleSwitcherDemo() {
  const [locale, setLocale] = createSignal(LOCALES[0].tag);

  return (
    <div class="not-prose flex w-full max-w-md flex-col items-center gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        <For each={LOCALES}>
          {(option) => (
            <Button
              variant={locale() === option.tag ? "solid" : "soft"}
              colorScheme={locale() === option.tag ? "primary" : "neutral"}
              size="sm"
              onClick={() => setLocale(option.tag)}
            >
              {option.label}
            </Button>
          )}
        </For>
      </div>

      <I18nProvider locale={locale()}>
        <LocalizedSurface />
      </I18nProvider>
    </div>
  );
}
