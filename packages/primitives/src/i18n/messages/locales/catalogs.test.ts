import { describe, expect, it } from "vitest";
import { CATALOGS, resolveCatalog } from "./catalogs";
import { MESSAGES_EN } from "./en";

/** Flatten a nested catalog to sorted dotted keys, for a concise parity comparison. */
function flatKeys(catalog: Record<string, Record<string, unknown>>): string[] {
  return Object.entries(catalog)
    .flatMap(([group, entries]) => Object.keys(entries).map((name) => `${group}.${name}`))
    .sort();
}

const EN_KEYS = flatKeys(MESSAGES_EN);
const LOCALES = Object.keys(CATALOGS);

describe("CATALOGS registry", () => {
  it("ships the expected locales", () => {
    expect(LOCALES.sort()).toEqual(
      ["da", "de", "el", "en", "es", "fi", "fr", "it", "pl", "pt", "sv"].sort(),
    );
  });

  it.each(
    Object.entries(CATALOGS),
  )("locale '%s' has full key parity with English (complete translation)", (_code, catalog) => {
    expect(flatKeys(catalog)).toEqual(EN_KEYS);
  });
});

describe("resolveCatalog", () => {
  it("selects by BCP-47 primary subtag, case-insensitively", () => {
    expect(resolveCatalog("de")).toBe(CATALOGS.de);
    expect(resolveCatalog("de-AT")).toBe(CATALOGS.de);
    expect(resolveCatalog("DE")).toBe(CATALOGS.de);
    expect(resolveCatalog("pt-BR")).toBe(CATALOGS.pt);
    expect(resolveCatalog("el-GR")).toBe(CATALOGS.el);
    expect(resolveCatalog("sv_SE")).toBe(CATALOGS.sv);
  });

  it("falls back to English for any unshipped locale", () => {
    expect(resolveCatalog("ja")).toBe(MESSAGES_EN);
    expect(resolveCatalog("")).toBe(MESSAGES_EN);
    expect(resolveCatalog("frr")).toBe(MESSAGES_EN); // North Frisian — not French
  });
});
