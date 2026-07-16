import type { JSX } from "@solidjs/web";
import { hydrate } from "@solidjs/web";

export interface HydratedComponent {
  container: HTMLElement;
  dispose: () => void;
}

interface HydrationGlobals {
  _$HY?: unknown;
}

/**
 * `hydrate()` reads `globalThis._$HY` unconditionally. A real app gets it from
 * `generateHydrationScript()`, which is a no-op (`voidFn`) in `@solidjs/web`'s client build
 * — so a browser test has to supply it. Only three fields are read on this path: `.done`,
 * `.completed` and `.events`. `.r` is the *resource/asset* registry consulted by
 * `sharedConfig.load`; the element registry `getNextElement()` looks in is built separately by
 * `gatherHydratable()`, which scans the container for `[_hk]` attributes. An empty `.r` is
 * therefore correct, not a bug.
 */
function bootstrapHydration(): () => void {
  const globals = globalThis as HydrationGlobals;
  globals._$HY = { events: [], completed: new WeakSet(), r: {} };
  return () => {
    globals._$HY = undefined;
  };
}

/**
 * Captures every `console.error`/`console.warn` call so the caller can assert hydration was
 * silent — a SolidJS hydration mismatch surfaces as a console message (and a would-be
 * reactivity diagnostic is a superset), so "zero output" is the check.
 *
 * Stores and restores the console functions **unbound**, the way `mount.ts` does: taking
 * `console.error.bind(console)` and restoring that would leave a different function object
 * than the one removed, so an install/restore cycle would leak a wrapper — and a later
 * `vi.spyOn(console, ...)` would be looking at the wrong function.
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
 * Hydrates `serverHtml` (genuine server output) with `ui` (the structurally identical client
 * tree) in a real browser, and asserts the full hydration contract — a silent fallback to a
 * client render otherwise looks identical to success (see docs/testing.md):
 *
 *  1. hydration logs no `console.error`/`console.warn` (mismatch warnings land there);
 *  2. no element is added or dropped (a fallback duplicates or replaces nodes);
 *  3. every server-rendered element is reused as the **same object**, in document order.
 *
 * The whole-tree reuse check generalizes and strictly strengthens a per-selector
 * `toBe(serverNode)` / `toHaveLength(1)`. `querySelectorAll("*")` returns only elements, so
 * Solid's internal hydration comment markers can't produce a false positive.
 *
 * Returns `{ container, dispose }` so the caller can drive interaction or run
 * `expectNoA11yViolations` against the hydrated tree. `dispose()` unmounts, removes the
 * container and clears the `_$HY` bootstrap. Browser-project only — it needs a real DOM and
 * the client hydrate build; there is no server render here (the client build's
 * `renderToStringAsync` returns `undefined`), which is why `serverHtml` is passed in.
 */
export function hydrateFixture(serverHtml: string, ui: () => JSX.Element): HydratedComponent {
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
  for (let index = 0; index < before.length; index++) {
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
