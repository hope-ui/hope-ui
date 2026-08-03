import type { JSX } from "@solidjs/web";
import { hydrate } from "@solidjs/web";
import { sharedConfig } from "solid-js";

export interface HydratedComponent {
  container: HTMLElement;
  dispose: () => void;
}

export interface HydrateFixtureOptions {
  /**
   * Whether every server node must survive as the **same object** (default `true`).
   *
   * Set `false` only for a tree that legitimately re-renders part of itself the moment hydration
   * settles, where replacing nodes is the feature under test rather than a failure. The one case today
   * is `I18nProvider` with no `locale`: it deliberately renders the server's `en-US`, then adopts the
   * visitor's locale, rebuilding every locale-derived node. The console-silence and element-count
   * checks still run, and are what still tells a re-render apart from a fallback.
   */
  expectNodeReuse?: boolean;
}

interface HydrationGlobals {
  _$HY?: unknown;
}

/**
 * `hydrate()` reads `globalThis._$HY` unconditionally. A real app gets it from the hydration script
 * Solid's *server* build emits, which is a no-op in the client build — so a browser test must supply
 * it. Only `.done`, `.completed` and `.events` are read on this path. `.r` is the resource/asset
 * registry, unrelated to element matching: Solid finds server nodes by scanning the container for
 * their `_hk` hydration-key attributes. So an empty `.r` here is correct, not an oversight.
 */
function bootstrapHydration(): () => void {
  const globals = globalThis as HydrationGlobals;
  globals._$HY = { events: [], completed: new WeakSet(), r: {} };
  return () => {
    // Drain the event queue before removing the global. Any top-level element with a delegated event
    // handler (`onClick`, `onInput`, …) makes Solid queue a microtask that replays the queue and then
    // writes `_$HY.events = null`. A test that hydrates and disposes synchronously runs that microtask
    // *after* this teardown, where the write would throw on an undefined global. Clearing the queue
    // first makes it return early instead — the same state Solid leaves once it has drained.
    sharedConfig.events = null;
    globals._$HY = undefined;
  };
}

/**
 * Captures every `console.error`/`console.warn` call so the caller can assert hydration was silent. A
 * SolidJS hydration mismatch surfaces only as a console message, so "zero output" is the whole check.
 *
 * Stores and restores the console functions **unbound**, for the same reason `mount.ts` does: binding
 * would restore a different function object than the one taken, leaking a wrapper per cycle.
 */
function recordConsole(): { restore: () => string[] } {
  const original = { error: console.error, warn: console.warn };
  const messages: string[] = [];
  const capture =
    (label: string) =>
    (...args: unknown[]) => {
      messages.push(`${label}: ${args.map(String).join(" ")}`);
    };
  console.error = capture("console.error");
  console.warn = capture("console.warn");
  return {
    restore() {
      console.error = original.error;
      console.warn = original.warn;
      return messages;
    },
  };
}

/**
 * Hydrates `serverHtml` (genuine server output) with `ui` (the structurally identical client tree) in
 * a real browser, and asserts the full hydration contract. Without these checks a silent fallback to a
 * plain client render is indistinguishable from success (see `__internal__/testing.md`):
 *
 *  1. hydration logged no `console.error`/`console.warn` — where mismatch warnings land;
 *  2. no element was added or dropped — a fallback duplicates or replaces nodes;
 *  3. every server-rendered element was reused as the **same object**, in document order.
 *
 * Check 3 over the whole tree strictly strengthens a per-selector `toBe(serverNode)`.
 * `querySelectorAll("*")` returns only elements, so Solid's hydration comment markers cannot cause a
 * false positive.
 *
 * Returns `{ container, dispose }` so the caller can drive interaction or run a11y checks against the
 * hydrated tree; `dispose()` unmounts, removes the container and clears the hydration bootstrap.
 * Browser-project only: it needs a real DOM and the client build, which cannot server-render — hence
 * `serverHtml` being passed in rather than produced here.
 */
export function hydrateFixture(
  serverHtml: string,
  ui: () => JSX.Element,
  options: HydrateFixtureOptions = {},
): HydratedComponent {
  const teardownHydration = bootstrapHydration();

  const container = document.createElement("div");
  container.innerHTML = serverHtml;
  document.body.appendChild(container);

  const before = [...container.querySelectorAll("*")];

  const consoleRecorder = recordConsole();
  let disposeSolid: (() => void) | undefined;
  const cleanup = () => {
    disposeSolid?.();
    container.remove();
    teardownHydration();
  };

  let logged: string[];
  try {
    disposeSolid = hydrate(ui, container);
  } catch (error) {
    consoleRecorder.restore();
    cleanup();
    throw error;
  }
  // Restore before asserting, so a thrown assertion never leaves the console patched.
  logged = consoleRecorder.restore();

  if (logged.length > 0) {
    cleanup();
    throw new Error(
      `hydration was not silent — it logged ${logged.length} console message(s), which is how a ` +
        `SolidJS hydration mismatch surfaces:\n${logged.map((message) => `  - ${message}`).join("\n")}`,
    );
  }

  const after = [...container.querySelectorAll("*")];
  if (after.length !== before.length) {
    cleanup();
    throw new Error(
      `hydration changed the element count (${before.length} → ${after.length}) — a fallback to a ` +
        "client render duplicates or drops nodes instead of reusing the server's.",
    );
  }
  for (let index = 0; options.expectNodeReuse !== false && index < before.length; index++) {
    const serverNode = before[index];
    if (after[index] !== serverNode) {
      cleanup();
      throw new Error(
        `hydration replaced element #${index} (<${serverNode?.tagName.toLowerCase()}>) instead of ` +
          "reusing the server's node — a silent client-render fallback.",
      );
    }
  }

  return { container, dispose: cleanup };
}
