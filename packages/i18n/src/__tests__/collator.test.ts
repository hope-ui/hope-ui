import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createCollator } from "../collator";
import { I18nProvider } from "../i18n-provider";

/**
 * Runs `children` under an `I18nProvider` without any DOM: these tests run in Node, so the provider is
 * called directly as a function and its lazy `children` accessor forced to evaluate.
 */
function renderWithLocale(locale: string | (() => string), children: () => void): void {
  const props =
    typeof locale === "string"
      ? {
          locale,
          get children() {
            children();
            return null;
          },
        }
      : {
          get locale() {
            return locale();
          },
          get children() {
            children();
            return null;
          },
        };
  const resolveChildren = I18nProvider(props);
  (resolveChildren as unknown as () => void)();
}

describe("createCollator", () => {
  it("folds case and diacritics under { usage: 'search', sensitivity: 'base' }", () => {
    createRoot((dispose) => {
      renderWithLocale("en-US", () => {
        const collator = createCollator({ usage: "search", sensitivity: "base" });
        const query = "cafe";
        const target = "Café";
        // The collator treats the accented, differently-cased target as a match for the plain query…
        expect(collator().compare(target.slice(0, query.length), query)).toBe(0);
        // …which is what naive case-folding cannot do, and why a collator is used at all.
        expect(target.toLowerCase().startsWith(query)).toBe(false);
      });
      dispose();
    });
  });

  it("rebuilds the collator when the locale changes", () => {
    const [locale, setLocale] = createSignal("en-US");
    let collator!: () => Intl.Collator;
    let dispose!: () => void;
    // `setLocale` has to run *outside* this callback: Solid throws REACTIVE_WRITE_IN_OWNED_SCOPE if a
    // signal owned by an enclosing scope is written from inside a scope it owns.
    createRoot((d) => {
      dispose = d;
      renderWithLocale(locale, () => {
        collator = createCollator();
      });
    });

    const first = collator();
    expect(first.resolvedOptions().locale.startsWith("en")).toBe(true);

    // A signal write is not visible to a plain read until the next flush, so wrap it in one.
    flush(() => setLocale("fr-FR"));
    const second = collator();
    expect(second.resolvedOptions().locale.startsWith("fr")).toBe(true);
    expect(second).not.toBe(first);
    dispose();
  });

  it("reuses the cached collator for the same locale + options, regardless of key order", () => {
    createRoot((dispose) => {
      let a!: () => Intl.Collator;
      let b!: () => Intl.Collator;
      renderWithLocale("de-DE", () => {
        a = createCollator({ usage: "search", sensitivity: "base" });
        b = createCollator({ sensitivity: "base", usage: "search" });
      });

      expect(a()).toBe(b());
      dispose();
    });
  });

  it("works with no I18nProvider mounted, against the detected default locale", () => {
    createRoot((dispose) => {
      const collator = createCollator();
      expect(collator()).toBeInstanceOf(Intl.Collator);
      dispose();
    });
  });
});
