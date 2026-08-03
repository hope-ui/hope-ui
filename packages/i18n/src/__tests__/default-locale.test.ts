import { describe, expect, it } from "vitest";
import { createDefaultLocale, getDefaultLocale } from "../default-locale";

describe("getDefaultLocale", () => {
  it("returns a valid BCP-47 locale + matching direction", () => {
    const { locale, direction } = getDefaultLocale();
    expect(typeof locale).toBe("string");
    expect(locale.length).toBeGreaterThan(0);
    expect(direction === "ltr" || direction === "rtl").toBe(true);
  });

  it("falls back to en-US/ltr off-browser (no navigator)", () => {
    // These tests run in Node, so there is no `navigator` — the same conditions as a server render,
    // and the same deterministic default it produces.
    const { locale, direction } = getDefaultLocale();
    expect(locale).toBe("en-US");
    expect(direction).toBe("ltr");
  });
});

describe("createDefaultLocale", () => {
  it("reports the detected locale with no hydration pass in flight", () => {
    // Detection is gated on hydration, not deferred unconditionally: with no pass in flight the very
    // first read is already the real locale, so a client-only app never renders a placeholder it then
    // has to replace. Here that locale happens to be en-US anyway, since there is no `navigator`; the
    // gate is exercised against a real one in `default-locale.browser.test.tsx`.
    const { locale, direction } = createDefaultLocale();
    expect(locale()).toBe("en-US");
    expect(direction()).toBe("ltr");
  });

  it("needs no reactive owner", () => {
    // It reads the shared registry instead of creating per-consumer state, so it can be called from
    // anywhere — including the context default in `i18n-provider.tsx`, which runs at module scope
    // where there is no owner to create a signal in.
    expect(() => createDefaultLocale().locale()).not.toThrow();
  });
});
