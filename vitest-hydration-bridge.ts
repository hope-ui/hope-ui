import { join } from "node:path";
import { createServer, type Plugin, type ViteDevServer } from "vite";
import solid from "vite-plugin-solid";
import { solidPluginOptions } from "./solid-babel-options";
import { hopeUiAlias, serverBuildAlias } from "./vitest-aliases";

// An always-fresh SSR generation bridge, so a hydration round-trip needs **zero committed fixture
// files** at any component count. A `.html` fixture per subject is snapshot-rot waiting to happen:
// at 40+ components each `_hk`-affecting structural change churns dozens of auto-regenerated files
// that stop being reviewed. Instead, the `browser` project imports server HTML on demand from a
// virtual module — `import buttonSSR from "virtual:hydration-fixture?id=button"` — that this plugin
// renders in-process, fresh each run. No persisted cache (a stale one would be a silent wrong-green),
// so there is nothing to commit and nothing to drift.
//
// The mechanism is vite-inside-vite. Hydration is two environments by definition (server render +
// client hydrate) and no single Vitest project can be both — `ssr` resolves the *server* solid
// builds, `browser` the *client* ones (see docs/testing.md). This plugin runs in the `browser`
// project (client builds) but spins up one nested Vite SSR server configured exactly like the `ssr`
// project — server-build aliases, `generate: "ssr"`, `ssr.noExternal` — and renders the subject's
// tree through it. Same config in, so the bytes match what the `ssr` project's inline snapshot pins,
// hydration keys (`_hk`) and all.

const VIRTUAL_ID = "virtual:hydration-fixture";
// Rollup's convention for a virtual module with no file on disk: a leading NUL keeps other plugins
// (and Vite's fs layer) from trying to read/transform it.
const RESOLVED_PREFIX = `\0${VIRTUAL_ID}`;

const repoRoot = import.meta.dirname;

/**
 * Registry mapping a fixture id to the absolute path of its **render entry** module — the single
 * source of truth for that subject's SSR → hydration tree. The entry exports `renderFixture()`
 * (a server render this bridge invokes) and the `Tree` component the `*.ssr.test.tsx` and
 * `*.browser.test.tsx` share. Adding a component means adding one line here and one entry module;
 * no committed fixture file, ever.
 */
export const HYDRATION_ENTRIES: Record<string, string> = {
  badge: join(repoRoot, "packages/components/src/badge/__tests__/badge.ssr-entry.tsx"),
  "badge-icons": join(
    repoRoot,
    "packages/components/src/badge/__tests__/badge-icons.ssr-entry.tsx",
  ),
  button: join(repoRoot, "packages/components/src/button/__tests__/button.ssr-entry.tsx"),
  "button-icons": join(
    repoRoot,
    "packages/components/src/button/__tests__/button-icons.ssr-entry.tsx",
  ),
  dialog: join(repoRoot, "packages/components/src/dialog/__tests__/dialog.ssr-entry.tsx"),
  calendar: join(repoRoot, "packages/components/src/calendar/__tests__/calendar.ssr-entry.tsx"),
  "theme-context": join(
    repoRoot,
    "packages/theming/src/theme-context/__tests__/theme-context.ssr-entry.tsx",
  ),
  // A component-free keyed tree the `hydrateFixture` helper's own suite hydrates to pin its
  // success and reuse-failure paths against genuine `_hk` markup.
  "hydrate-fixture": join(
    repoRoot,
    "packages/internal-test-utils/src/hydrate-fixture/__tests__/hydrate-fixture.ssr-entry.tsx",
  ),
};

let ssrServerPromise: Promise<ViteDevServer> | undefined;

/**
 * One lazily-created nested SSR Vite server, shared across every fixture id and reused for the whole
 * run. Middleware mode with no HMR/watch/optimizer so it opens no port and holds no file handles that
 * would keep the process alive; its only job is `ssrLoadModule`. Mirrors the `ssr` Vitest project's
 * resolution precisely — the same `serverBuildAlias` plus `ssr.noExternal` (Vite's own equivalent of
 * `server.deps.inline`) that stops `@solidjs/web`'s internal `import ... from "solid-js"` from
 * escaping to the *browser* build and yielding two `solid-js` instances (the "createUniqueId cannot
 * be used outside of a reactive context" failure documented in vitest.config.ts).
 */
function getSsrServer(): Promise<ViteDevServer> {
  if (!ssrServerPromise) {
    ssrServerPromise = createServer({
      configFile: false,
      root: repoRoot,
      appType: "custom",
      logLevel: "warn",
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
      plugins: [solid(solidPluginOptions({ generate: "ssr", hydratable: true }))],
      resolve: { alias: [...hopeUiAlias, ...serverBuildAlias] },
      // `/@solid-primitives\//`: an adopted pre-compiled dep must be inlined for the same
      // reason `@solidjs/web`/`solid-js` are — externalized, its own `import ... from "solid-js"`
      // escapes the server-build alias and resolves a *second* `solid-js` copy, so a render-body
      // compute-form signal skips its hydration id on the server (`_hk` shifts down one vs the
      // client) and hydration silently mismatches. This must stay in lockstep with the `ssr`
      // project's `server.deps.inline` in vitest.config.ts. See docs/solid-primitives-eval.md.
      ssr: { noExternal: ["@solidjs/web", "solid-js", /@solid-primitives\//] },
    });
  }
  return ssrServerPromise;
}

/**
 * Renders a subject's fixture to genuine server HTML, fresh. Exported so a plain Node script (or a
 * future non-Vitest caller) can drive the same render the virtual module serves.
 */
export async function renderFixtureHtml(id: string): Promise<string> {
  const entry = HYDRATION_ENTRIES[id];
  if (!entry) {
    throw new Error(
      `Unknown hydration fixture id "${id}". Known ids: ${Object.keys(HYDRATION_ENTRIES).join(", ")}. ` +
        "Add a render entry to HYDRATION_ENTRIES in vitest-hydration-bridge.ts.",
    );
  }

  const server = await getSsrServer();
  const mod = (await server.ssrLoadModule(entry)) as { renderFixture?: () => Promise<unknown> };
  if (typeof mod.renderFixture !== "function") {
    throw new Error(
      `${entry} must export a \`renderFixture()\` function for the hydration bridge.`,
    );
  }

  const html = await mod.renderFixture();
  if (typeof html !== "string") {
    throw new Error(
      `renderFixture() in ${entry} returned ${typeof html}, not a string — the nested server must ` +
        "resolve the *server* builds of solid-js and @solidjs/web (renderToStringAsync returns " +
        "undefined on the client build).",
    );
  }
  return html;
}

/**
 * The `browser`-project Vite plugin exposing `virtual:hydration-fixture?id=<subject>`. Its default
 * export is the fresh server HTML string, so a hydration test does
 * `import ssr from "virtual:hydration-fixture?id=button"` and feeds it to `hydrateFixture`.
 */
export function hydrationFixtureBridge(): Plugin {
  return {
    name: "hope-ui:hydration-fixture-bridge",
    resolveId(id) {
      // Keep the `?id=…` query as part of the resolved id so `load` can read it.
      if (id === VIRTUAL_ID || id.startsWith(`${VIRTUAL_ID}?`)) {
        return RESOLVED_PREFIX + id.slice(VIRTUAL_ID.length);
      }
      return undefined;
    },
    async load(id) {
      if (!id.startsWith(RESOLVED_PREFIX)) {
        return undefined;
      }
      const query = id.slice(RESOLVED_PREFIX.length);
      const fixtureId = new URLSearchParams(query.replace(/^\?/, "")).get("id");
      if (!fixtureId) {
        throw new Error(
          `Import "${VIRTUAL_ID}" with an ?id=<subject> query, e.g. "${VIRTUAL_ID}?id=button".`,
        );
      }
      const html = await renderFixtureHtml(fixtureId);
      return `export default ${JSON.stringify(html)};`;
    },
    async closeBundle() {
      // Release the nested server's handles when the run ends, so the process can exit cleanly.
      if (ssrServerPromise) {
        const server = await ssrServerPromise;
        ssrServerPromise = undefined;
        await server.close();
      }
    },
  };
}
