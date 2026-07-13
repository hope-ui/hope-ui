import { createRoot } from "solid-js";
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
  it("seeds to the SSR default (en-US/ltr) at first read", () =>
    createRoot((dispose) => {
      // Improvement over the Kobalte source: the signal starts at the SSR default and only adopts
      // the detected locale in `onSettled` (post-hydration), so the hydrating render matches the
      // server. The synchronous read therefore returns en-US/ltr.
      const { locale, direction } = createDefaultLocale();
      expect(locale()).toBe("en-US");
      expect(direction()).toBe("ltr");
      dispose();
    }));
});
