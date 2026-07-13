# `MESSAGES_EN` — English catalog

The built-in **English** message catalog: the zero-config floor, and the fallback any other locale's
catalog defers to for a key it omits. Typed as `I18nCatalog` (nested `group.name` → entry), so it must
carry every key in the contract or it fails to compile.

- **Shape + key list:** `../messages.md` (the `I18nMessageMap` contract).
- **Resolution / how it's selected:** `../../translate/translate.md` (chosen when the active locale is
  not `fr…`, and as the final fallback).
- **String values are frozen** for the keys that feed the committed calendar SSR fixture (pinned to
  `en-US`) — see `en.test.ts`. Changing e.g. `calendar.previousLabel` means regenerating that fixture.

Add a locale by copying this file (e.g. `de.ts`), translating each value, registering it in
`catalogs.ts`, and exporting it from the i18n barrel; the `I18nCatalog` type guarantees completeness.
See `catalogs.md`.
