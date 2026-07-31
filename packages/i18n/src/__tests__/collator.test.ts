import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it } from "vitest";
import { createCollator } from "../collator";
import { I18nProvider } from "../i18n-provider";

/**
 * Calls a context-providing component directly (no JSX/DOM needed — `unit` is Node with no
 * `document`) and forces its lazy `children` accessor to evaluate, exactly like
 * `create-component-context.test.ts` does for `createComponentContext`'s Provider.
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
        // The collator considers the accented, differently-cased target a match for the plain
        // query...
        expect(collator().compare(target.slice(0, query.length), query)).toBe(0);
        // ...which is exactly what `toLowerCase().startsWith()` cannot do — it only folds case.
        expect(target.toLowerCase().startsWith(query)).toBe(false);
      });
      dispose();
    });
  });

  it("rebuilds the collator when the locale changes", () => {
    const [locale, setLocale] = createSignal("en-US");
    let collator!: () => Intl.Collator;
    let dispose!: () => void;
    // `setLocale` below must run *outside* this synchronous callback — writing an ancestor-owned
    // signal from within it throws `REACTIVE_WRITE_IN_OWNED_SCOPE`.
    createRoot((d) => {
      dispose = d;
      renderWithLocale(locale, () => {
        collator = createCollator();
      });
    });

    const first = collator();
    expect(first.resolvedOptions().locale.startsWith("en")).toBe(true);

    // The client build defers a plain signal write until the next flush.
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
