import { Button } from "@hope-ui/components/button";
import { createSignal, For, onSettled } from "solid-js";
import { ChevronRightIcon, PaletteIcon } from "~/components/Icons";
import { CssOutput } from "./CssOutput";
import { ALL_FAMILIES, BRAND_FAMILIES, NEUTRAL_FAMILIES } from "./palette";
import { RadiusControl } from "./RadiusControl";
import { RolePicker } from "./RolePicker";
import { ThemePreview } from "./ThemePreview";
import {
  HOPE_DEFAULT_CONFIG,
  type NeutralFamily,
  ROLE_META,
  STATUS_ROLES,
  type ThemeConfig,
} from "./theme-config";

// The Theme Creator page shell. It owns the single `config` signal (seeded to hope's defaults so the
// prerendered SSG markup is deterministic) and wires the three regions: controls → live preview →
// generated CSS. Persistence to localStorage is opt-in and strictly client-side — read once in
// `onSettled`, written only on a user action (never during render), so hydration stays clean.

const STORAGE_KEY = "hope-theme-creator-config";

const FAMILY_SET: ReadonlySet<string> = new Set(ALL_FAMILIES);
const NEUTRAL_SET: ReadonlySet<string> = new Set(NEUTRAL_FAMILIES);

/** Structural guard for a value read back from localStorage (never trust stored JSON). */
function isValidConfig(value: unknown): value is ThemeConfig {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const c = value as Record<string, unknown>;
  const chromatic = (["primary", "success", "info", "warning", "danger"] as const).every(
    (k) => typeof c[k] === "string" && FAMILY_SET.has(c[k] as string),
  );
  return (
    chromatic &&
    typeof c.neutral === "string" &&
    NEUTRAL_SET.has(c.neutral) &&
    typeof c.radius === "string"
  );
}

function loadStored(): ThemeConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return isValidConfig(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persist(config: ThemeConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // localStorage may be unavailable (private mode, disabled). Persistence is best-effort.
  }
}

export function ThemeCreator() {
  const [config, setConfig] = createSignal<ThemeConfig>(HOPE_DEFAULT_CONFIG);

  // The one write path: update state AND persist. Reached only from user interaction, so no browser
  // API runs during SSR/hydration render.
  const update = (next: ThemeConfig) => {
    setConfig(next);
    persist(next);
  };

  // Restore a saved theme after mount (client-only), upgrading from the default the server rendered.
  onSettled(() => {
    const stored = loadStored();
    if (stored) {
      setConfig(stored);
    }
  });

  return (
    <div class="mx-auto max-w-360 px-6 py-10 sm:py-14">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="max-w-2xl">
          <span class="inline-flex items-center gap-2 rounded-full border border-primary-line bg-primary-soft/60 px-3 py-1 text-xs font-medium text-primary-emphasis">
            <PaletteIcon class="size-3.5" />
            Theme Creator
          </span>
          <h1 class="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Make hope yours
          </h1>
          <p class="mt-3 text-pretty text-lg leading-relaxed text-foreground-muted">
            Pick a color family per role and a corner radius. See it render live across real hope
            components, then copy a ready-to-paste <code class="text-foreground">theme.css</code>{" "}
            that redefines every token.
          </p>
        </div>
        <Button
          variant="ghost"
          colorScheme="neutral"
          size="sm"
          onClick={() => update(HOPE_DEFAULT_CONFIG)}
        >
          Reset to hope defaults
        </Button>
      </header>

      <div class="mt-10 grid gap-6 xl:grid-cols-[minmax(280px,320px)_minmax(0,1fr)_minmax(320px,400px)]">
        {/* ── Controls ─────────────────────────────────────────────────────────── */}
        <div class="space-y-6 rounded-2xl border border-subtle bg-surface-raised p-5 shadow-sm xl:sticky xl:top-20 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-auto">
          <RolePicker
            name="tc-primary"
            label={ROLE_META.primary.label}
            hint={ROLE_META.primary.hint}
            families={BRAND_FAMILIES}
            value={config().primary}
            onChange={(f) => update({ ...config(), primary: f })}
          />

          <RolePicker
            name="tc-neutral"
            label={ROLE_META.neutral.label}
            hint={ROLE_META.neutral.hint}
            families={NEUTRAL_FAMILIES}
            value={config().neutral}
            onChange={(f: NeutralFamily) => update({ ...config(), neutral: f })}
          />

          {/* Status roles under a native disclosure so the default UI stays small. */}
          <details class="group border-t border-subtle pt-4">
            <summary class="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              <span>Advanced — status colors</span>
              <ChevronRightIcon class="size-4 text-foreground-subtle transition-transform group-open:rotate-90" />
            </summary>
            <div class="mt-4 space-y-6">
              <For each={STATUS_ROLES}>
                {(role) => (
                  <RolePicker
                    name={`tc-${role}`}
                    label={ROLE_META[role].label}
                    hint={ROLE_META[role].hint}
                    families={BRAND_FAMILIES}
                    value={config()[role]}
                    // `role` is a status key and `f` a Family (its value type), so the computed-key
                    // spread is a valid ThemeConfig — assert past TS's index-signature widening.
                    onChange={(f) => update({ ...config(), [role]: f } as ThemeConfig)}
                  />
                )}
              </For>
            </div>
          </details>

          <div class="border-t border-subtle pt-4">
            <RadiusControl
              value={config().radius}
              onChange={(r) => update({ ...config(), radius: r })}
            />
          </div>
        </div>

        {/* ── Live preview ─────────────────────────────────────────────────────── */}
        <ThemePreview config={config()} />

        {/* ── Generated CSS ────────────────────────────────────────────────────── */}
        <div class="xl:sticky xl:top-20 xl:self-start">
          <CssOutput config={config()} />
        </div>
      </div>
    </div>
  );
}
