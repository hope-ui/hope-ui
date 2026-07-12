import { hydrate } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";
// A component authored with a LITERAL host element, pre-compiled the way a consumer's
// vite-plugin-solid would compile our shipped `"solid"`-condition source for the *client*
// (generate:'dom' + hydratable). Imported as `.mjs` so the test harness (which compiles
// generate:'dom' *without* hydratable) doesn't recompile it and strip the hydration path.
// @ts-expect-error — plain compiled JS, no types
import { LiteralBox } from "./__fixtures__/literal-box.client.mjs";
import ssrFixture from "./__fixtures__/literal-box-ssr.html?raw";

/**
 * The canonical proof of the SSR de-overengineering refactor (Part A): a hand-written
 * component whose internals use a **literal host element** round-trips server → client under
 * the ship-source distribution model. The server HTML in `literal-box-ssr.html` was produced
 * by `renderToStringAsync` against the `generate:'ssr'` compile of the same source (server-safe
 * `ssr()` helpers, not the client-only `template()` the old "no literal host element" rule
 * feared). Here the `generate:'dom'`+hydratable compile hydrates it in place.
 */
describe("literal host element — SSR → hydrate (ship-source model)", () => {
  function bootstrapHydration(): () => void {
    const globals = globalThis as { _$HY?: unknown };
    globals._$HY = { events: [], completed: new WeakSet(), r: {} };
    return () => {
      globals._$HY = undefined;
    };
  }

  it("hydrates the server-rendered literal <div> in place, no mismatch, node reused", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const teardown = bootstrapHydration();

    const container = document.createElement("div");
    container.innerHTML = ssrFixture;
    document.body.appendChild(container);

    const serverDiv = container.querySelector('[data-testid="ssr-box"]');
    expect(serverDiv).not.toBeNull();

    const dispose = hydrate(
      () => LiteralBox({ class: "bg_red\\.500 p_4", children: "Hello SSR" }),
      container,
    );

    expect(consoleError).not.toHaveBeenCalled();
    expect(consoleWarn).not.toHaveBeenCalled();
    // One div, and it is the *same* node the server sent (not a client re-render).
    expect(container.querySelectorAll('[data-testid="ssr-box"]')).toHaveLength(1);
    expect(container.querySelector('[data-testid="ssr-box"]')).toBe(serverDiv);
    expect(serverDiv?.textContent).toBe("Hello SSR");
    expect(serverDiv?.getAttribute("class")).toContain("bg_red");

    dispose();
    container.remove();
    teardown();
    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });
});
