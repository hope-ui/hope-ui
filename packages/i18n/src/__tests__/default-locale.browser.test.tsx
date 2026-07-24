import { hydrate } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
import { createDefaultLocale } from "../default-locale";

/**
 * The hydration gate, exercised against a real `navigator` and a real `hydrate()` pass — the only
 * place where "detected locale" and "what the server rendered" actually differ.
 *
 * Why it matters: hydration reuses the server's DOM rather than re-deriving it. A client that reports
 * its own locale *during* the pass produces markup that silently contradicts its own state — no
 * console warning, no replaced node, just a component quietly working from different data than the
 * text on screen. `@hope-ui/components`' calendar round-trip covers the full end-to-end consequence;
 * this covers the mechanism.
 */
function withBrowserLocale(locale: string): () => void {
  const languageDescriptor = Object.getOwnPropertyDescriptor(
    Navigator.prototype,
    "language",
  ) as PropertyDescriptor;
  Object.defineProperty(navigator, "language", { value: locale, configurable: true });
  const registryKey = Symbol.for("@hope-ui/i18n:locale-registry");
  const globalScope = globalThis as Record<symbol, unknown>;
  delete globalScope[registryKey];

  return () => {
    Object.defineProperty(navigator, "language", languageDescriptor);
    delete globalScope[registryKey];
  };
}

describe("createDefaultLocale hydration gate", () => {
  it("reports en-US during a hydration pass, then the detected locale", async () => {
    const restore = withBrowserLocale("fr-FR");
    const globals = globalThis as { _$HY?: unknown };
    globals._$HY = { events: [], completed: new WeakSet(), r: {} };
    const container = document.createElement("div");
    container.innerHTML = "<span>x</span>";
    document.body.appendChild(container);

    let duringHydration: string | undefined;
    const detected = createDefaultLocale();
    const dispose = hydrate(() => {
      duringHydration = detected.locale();
      return <span>x</span>;
    }, container);

    // Matches the markup the server produced, which is the whole point.
    expect(duringHydration).toBe("en-US");

    // The gate opens on the first microtask after the pass ends.
    await vi.waitFor(() => expect(detected.locale()).toBe("fr-FR"));
    expect(detected.direction()).toBe("ltr");

    dispose();
    container.remove();
    globals._$HY = undefined;
    restore();
  });

  it("reports the detected locale immediately when nothing is hydrating", () => {
    const restore = withBrowserLocale("ar-EG");
    const detected = createDefaultLocale();

    // A client-only app pays nothing for the gate: no placeholder render, no swap. Direction comes
    // along with it, so an RTL locale lays out correctly on the first paint.
    expect(detected.locale()).toBe("ar-EG");
    expect(detected.direction()).toBe("rtl");

    restore();
  });
});
