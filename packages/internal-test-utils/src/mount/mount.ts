import type { JSX } from "@solidjs/web";
import { render as solidRender } from "@solidjs/web";

export interface MountedComponent {
  container: HTMLElement;
  dispose: () => void;
}

/**
 * The two SolidJS 2.0 dev diagnostics this codebase has hit for real, and which a passing
 * test would otherwise happily print 170 times a run:
 *
 * - `STRICT_READ_UNTRACKED` — a reactive value read outside a tracking scope. This is the
 *   one diagnostic that catches the ref-race bug CLAUDE.md documents in prose: a primitive
 *   that reads a conditionally-rendered element's ref on the activating edge without
 *   tracking it in `compute` gets `undefined` forever, and Escape/outside-click silently
 *   stop working. A deliberate untracked read is spelled `untrack(...)`, which suppresses
 *   the warning — so anything still emitting one is unreviewed.
 * - `REACTIVE_WRITE_IN_OWNED_SCOPE` — a descendant writing to an ancestor-owned signal from
 *   its render body. Solid throws this rather than logging it, so a test would normally fail
 *   on its own. It is listed here for the case where the write happens inside an effect,
 *   where Solid catches the throw and re-reports it as `console.error(err)` instead.
 */
const DIAGNOSTIC_CODES = ["STRICT_READ_UNTRACKED", "REACTIVE_WRITE_IN_OWNED_SCOPE"] as const;

let installCount = 0;
let originalConsole: { warn: typeof console.warn; error: typeof console.error } | undefined;
let recorded: string[] = [];

/** Solid logs diagnostics as a plain string, except an effect's caught throw (an `Error`). */
function diagnosticIn(args: unknown[]): string | undefined {
  for (const arg of args) {
    const message = typeof arg === "string" ? arg : arg instanceof Error ? arg.message : undefined;
    if (message === undefined) continue;
    if (DIAGNOSTIC_CODES.some((code) => message.includes(`[${code}]`))) return message;
  }
  return undefined;
}

/**
 * Records rather than throws on sight. Throwing from inside `console.warn` would land in
 * whatever call stack Solid happens to be in — a component body, an effect flush, an effect
 * *cleanup*. Solid catches an effect's throw and, past a second failure, calls
 * `haltReactivity()`, which is module-global state that would poison every later test in the
 * file. `dispose()` is a checkpoint the test owns, outside any reactive flush.
 */
function installConsoleGuard(): void {
  if (installCount++ > 0) return;

  // Stored unbound, and restored unbound. `console.warn.bind(console)` would restore a
  // *different function object* than the one taken, so an install/uninstall cycle would leave
  // an extra `bound` wrapper behind each time — and a test asserting on `console.warn`'s
  // identity (or a `vi.spyOn(...).mockRestore()`) would be looking at the wrong function.
  const warn = console.warn;
  const error = console.error;
  originalConsole = { warn, error };

  const intercept =
    (forward: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      const diagnostic = diagnosticIn(args);
      if (diagnostic !== undefined) {
        // Swallowed, not forwarded. `dispose()` is about to raise it as a test failure with
        // the full text, so re-printing it would only put the message back in the scrollback
        // it spent 170 lines a run being ignored in. It also keeps
        // `pnpm test:browser 2>&1 | grep -c STRICT_READ_UNTRACKED` honest at zero.
        recorded.push(diagnostic);
        return;
      }
      // Everything else passes straight through, so a `vi.spyOn(console, "error")` installed
      // by the test under way keeps seeing exactly what it spied on.
      forward.call(console, ...args);
    };

  console.warn = intercept(warn);
  console.error = intercept(error);
}

function uninstallConsoleGuard(): void {
  if (--installCount > 0) return;
  if (originalConsole === undefined) return;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  originalConsole = undefined;
}

function takeRecordedDiagnostics(): string[] {
  const diagnostics = recorded;
  recorded = [];
  return diagnostics;
}

function assertNoDiagnostics(): void {
  const diagnostics = takeRecordedDiagnostics();
  if (diagnostics.length === 0) return;

  const unique = [...new Set(diagnostics)];
  const summary = unique.map((message) => `  - ${message}`).join("\n");
  throw new Error(
    `SolidJS emitted ${diagnostics.length} reactivity diagnostic(s) while this tree was mounted:\n${summary}\n\n` +
      "These are load-bearing, not noise — see mount.md. Fix the read/write, or spell a " +
      "deliberate untracked read as `untrack(...)`.",
  );
}

/**
 * Mounts a Solid component tree into a detached, document-attached container for
 * browser-mode tests, and returns a `dispose()` that unmounts + removes it.
 *
 * `dispose()` **throws** if SolidJS emitted a `STRICT_READ_UNTRACKED` or
 * `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic while the tree was mounted. See mount.md.
 */
export function mount(ui: () => JSX.Element): MountedComponent {
  // Nothing should be pending here. If it is, an earlier tree emitted a diagnostic and was
  // never disposed — surface it now rather than letting it fail whichever test disposes next.
  assertNoDiagnostics();

  installConsoleGuard();

  let disposeSolid: () => void;
  const container = document.createElement("div");
  document.body.appendChild(container);

  try {
    disposeSolid = solidRender(ui, container);
  } catch (error) {
    uninstallConsoleGuard();
    container.remove();
    throw error;
  }

  return {
    container,
    dispose() {
      try {
        disposeSolid();
      } finally {
        container.remove();
        uninstallConsoleGuard();
      }
      assertNoDiagnostics();
    },
  };
}
