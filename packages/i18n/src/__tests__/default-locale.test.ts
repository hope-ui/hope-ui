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
    // The `unit` project is `environment: "node"`, so `navigator` is absent — the deterministic
    // server-safe default, which is exactly what the SSR path renders.
    const { locale, direction } = getDefaultLocale();
    expect(locale).toBe("en-US");
    expect(direction).toBe("ltr");
  });
});

describe("createDefaultLocale", () => {
  it("reports the detected locale with no hydration pass in flight", () => {
    // Detection is gated on hydration, not deferred unconditionally: outside a hydration pass the
    // first read is already the real locale, so a client-only app never renders an `en-US`
    // placeholder it has to replace. (Off-browser here, so "detected" *is* en-US — the gate itself is
    // exercised against a real `navigator` in `default-locale.browser.test.ts`.)
    const { locale, direction } = createDefaultLocale();
    expect(locale()).toBe("en-US");
    expect(direction()).toBe("ltr");
  });

  it("needs no reactive owner", () => {
    // It reads the shared registry rather than creating per-consumer state, so it is safe to call
    // from anywhere — including the module-scope context default in `i18n-provider.tsx`, which has no
    // owner to create a signal in.
    expect(() => createDefaultLocale().locale()).not.toThrow();
  });
});
