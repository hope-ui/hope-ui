import type { JSX } from "@solidjs/web";
import { render as solidRender } from "@solidjs/web";

export interface MountedComponent {
  container: HTMLElement;
  dispose: () => void;
}

/**
 * The two SolidJS dev diagnostics this codebase has hit for real, and that a *passing* test would
 * otherwise print by the hundred without failing:
 *
 * - `STRICT_READ_UNTRACKED` — a reactive value read outside a tracking scope. This is what catches
 *   the ref race: a primitive that reads a conditionally-rendered element's ref without tracking it
 *   gets `undefined` forever, and Escape or outside-click silently stop working. A deliberate
 *   untracked read is spelled `untrack(...)` and emits nothing, so any warning left is unreviewed.
 * - `REACTIVE_WRITE_IN_OWNED_SCOPE` — a descendant writing a signal owned by an ancestor from its
 *   render body. Solid throws on that, so a test normally fails by itself; it is listed here for the
 *   case where the write happens inside an effect, which Solid catches and merely `console.error`s.
 */
const DIAGNOSTIC_CODES = ["STRICT_READ_UNTRACKED", "REACTIVE_WRITE_IN_OWNED_SCOPE"] as const;

let installCount = 0;
let originalConsole: { warn: typeof console.warn; error: typeof console.error } | undefined;
let recorded: string[] = [];

/** Solid logs diagnostics as a plain string, except an effect's caught throw (an `Error`). */
function diagnosticIn(args: unknown[]): string | undefined {
  for (const arg of args) {
    const message = typeof arg === "string" ? arg : arg instanceof Error ? arg.message : undefined;
    if (message === undefined) {
      continue;
    }
    if (DIAGNOSTIC_CODES.some((code) => message.includes(`[${code}]`))) {
      return message;
    }
  }
  return undefined;
}

/**
 * Records rather than throwing on sight. A throw from inside `console.warn` would land in whatever
 * call stack Solid happens to be in — a component body, an effect flush, an effect *cleanup*. Solid
 * catches an effect's throw and, after a second failure, halts reactivity process-wide, which would
 * poison every later test in the file. `dispose()` is a checkpoint the test owns, outside any flush.
 */
function installConsoleGuard(): void {
  if (installCount++ > 0) {
    return;
  }

  // Stored unbound, and restored unbound. `console.warn.bind(console)` would restore a *different
  // function object* than the one taken, leaving an extra wrapper behind on every install/uninstall
  // cycle — and a test asserting on `console.warn`'s identity, or calling `mockRestore()`, would then
  // be looking at the wrong function.
  const warn = console.warn;
  const error = console.error;
  originalConsole = { warn, error };

  const intercept =
    (forward: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      const diagnostic = diagnosticIn(args);
      if (diagnostic !== undefined) {
        // Swallowed, not forwarded: `dispose()` is about to raise it as a test failure carrying the
        // full text, so printing it too would only bury it in the scrollback again — and would keep
        // grepping a run's output for these codes from ever reaching zero.
        recorded.push(diagnostic);
        return;
      }
      // Everything else passes straight through, so a `vi.spyOn(console, "error")` the test itself
      // installed keeps seeing exactly what it spied on.
      forward.call(console, ...args);
    };

  console.warn = intercept(warn);
  console.error = intercept(error);
}

function uninstallConsoleGuard(): void {
  if (--installCount > 0) {
    return;
  }
  if (originalConsole === undefined) {
    return;
  }
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
  if (diagnostics.length === 0) {
    return;
  }

  const unique = [...new Set(diagnostics)];
  const summary = unique.map((message) => `  - ${message}`).join("\n");
  throw new Error(
    `SolidJS emitted ${diagnostics.length} reactivity diagnostic(s) while this tree was mounted:\n${summary}\n\n` +
      "These are load-bearing, not noise — see mount.md. Fix the read/write, or spell a " +
      "deliberate untracked read as `untrack(...)`.",
  );
}

/**
 * Mounts a Solid component tree into its own container appended to `document.body`, and returns a
 * `dispose()` that unmounts and removes it.
 *
 * `dispose()` **throws** if SolidJS emitted a `STRICT_READ_UNTRACKED` or
 * `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic while the tree was mounted. Full rationale in
 * `__internal__/internal-test-utils/mount/mount.md`.
 */
export function mount(ui: () => JSX.Element): MountedComponent {
  // Nothing should be pending here. If something is, an earlier tree emitted a diagnostic and was
  // never disposed — surface it now instead of failing whichever test disposes next.
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
