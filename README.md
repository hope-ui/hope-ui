# hope-ui

**hope-ui** is a component library for [SolidJS](https://www.solidjs.com/) 2.0. Import a component
and it works — accessible, keyboard-friendly, and styled out of the box. It's the
all-in-one option (in the spirit of MUI or Mantine) that the Solid ecosystem has been
missing, not a headless or copy-paste kit.

Components are styled with **Tailwind v4** and built on an internal headless kernel that handles the
hard parts — focus, keyboard navigation, dismissal, and accessibility — so you don't have to think
about any of it to use them.

- **Documentation:** [hope-ui.dev](https://hope-ui.dev)
- **Storybook:** [storybook.hope-ui.dev](https://storybook.hope-ui.dev)

## Status

Pre-release and **not published yet**. hope-ui targets `solid-js@2.0.0-beta.x` (pinned via the
`pnpm-workspace.yaml` catalog), and the release model is: build on the pinned beta → wait for
SolidJS 2.0 stable → fix the beta→stable breakage → publish 1.0. Nothing ships to npm before 2.0
stable lands. See [`__internal__/plan.md`](__internal__/plan.md) for the architecture and phased plan, and
[`__internal__/roadmap.md`](__internal__/roadmap.md) for the component backlog.

## Packages

This is a pnpm + Turborepo workspace. Every package lives under [`packages/`](packages/).

| Package | Role |
| ------- | ---- |
| [`@hope-ui/components`](packages/components/README.md) | Public components, one subpath export each (`@hope-ui/components/button`, `.../dialog`, …). The product. |
| [`@hope-ui/primitives`](packages/primitives/README.md) | The headless behavior kernel — **internal / advanced escape hatch**, not a stability-promised API. Everything else composes it. |
| [`@hope-ui/theming`](packages/theming/README.md) | The theming contract and dependency-inversion seam: `ThemeProvider`/`useRecipe`, the `RecipeRegistry`, the semantic-token vocabulary, and the `tv`/`cn`/`cx` styling seam. |
| [`@hope-ui/presets`](packages/presets/README.md) | The default visual identity, `@hope-ui/presets/hope` — design tokens (a Tailwind CSS entry) plus a runtime recipe map. |
| [`@hope-ui/i18n`](__internal__/i18n/) | Dependency-free locale layer: locale + reading-direction context and the built-in message catalogs. Imports no other `@hope-ui/*`, so it sits at the bottom of the graph; end users import `I18nProvider` from it. |
| [`@hope-ui/internal-test-utils`](packages/internal-test-utils/README.md) | Private shared test harness (`mount` + `expectNoA11yViolations` + `hydrateFixture`). Not published. |

Runtime dependency direction: `@hope-ui/i18n` ← `@hope-ui/primitives` ← `@hope-ui/theming` ←
`@hope-ui/components`. Presets depend *up* on `@hope-ui/theming` for the contract they implement.
Components read recipes through theming; presets implement them; neither knows about the other.

## Getting started

> Not yet on npm — this section describes the intended install for when 1.0 ships.

```bash
pnpm add @hope-ui/components @hope-ui/theming @hope-ui/presets
```

A SolidJS 2.0 app wires up the default preset once, then uses components anywhere below the
provider:

```tsx
// app entry CSS (imported by your Tailwind v4 entry)
// @import "tailwindcss";
// @import "@hope-ui/presets/hope/tailwind.css";  // structure
// @import "@hope-ui/presets/hope/theme.css";     // hope's token values (or your own)

import { ThemeProvider } from "@hope-ui/theming";
import { hope } from "@hope-ui/presets/hope";
import { Button } from "@hope-ui/components/button";

function App() {
  return (
    <ThemeProvider preset={hope}>
      <Button colorScheme="primary" variant="solid">
        Save
      </Button>
    </ThemeProvider>
  );
}
```

`@import "@hope-ui/presets/hope/tailwind.css"` maps the `--hope-*` design tokens to clean utilities
(`bg-primary`, `text-on-primary`, …), and `@import "@hope-ui/presets/hope/theme.css"` supplies their
values (a separate, opt-out import — swap in your own to restyle); `<ThemeProvider preset={hope}>`
gives components their recipes at runtime. `hope` is a **zero-DOM preset** — the provider renders
no markup of its own. See [`__internal__/theming.md`](__internal__/theming.md).

## Development

```bash
pnpm install              # install workspace deps
pnpm build                # turbo: build all packages (tsdown → JSX-preserved .jsx + .d.ts per subpath)
pnpm lint                 # biome check .
pnpm format               # biome format --write .
pnpm typecheck            # turbo: tsc --noEmit per package (resolves siblings to src, never dist)
pnpm test                 # vitest run --project=unit    (node, no DOM, pure logic)
pnpm test:ssr             # vitest run --project=ssr     (node, SERVER builds of solid-js + @solidjs/web)
pnpm test:browser         # vitest run --project=browser (real Chromium, DOM + hydration)
pnpm storybook            # visual harness on :6006
pnpm build:storybook      # static Storybook build (also the CI smoke test for the config)
pnpm check:coverage-parity  # fails if a src file lacks a test / usage doc / story, or a leaf folder sprawls
```

The three Vitest projects are split by **module resolution**, not by taste — `unit` (client
builds, no DOM), `ssr` (server builds of both `solid-js` and `@solidjs/web`), `browser` (real
Chromium via Playwright). Playwright's browser is installed once (CI does this automatically):

```bash
pnpm exec playwright install --only-shell chromium
```

Run a single test file or a single test:

```bash
pnpm exec vitest run --project=browser packages/components/src/button/__tests__/button.browser.test.tsx
pnpm exec vitest run --project=browser -t "fires onClick"
```

See [`__internal__/testing.md`](__internal__/testing.md) before writing any test.

## Repository layout

```
packages/
  components/            @hope-ui/components  — public components (subpath per component)
  primitives/            @hope-ui/primitives  — headless behavior kernel
  theming/               @hope-ui/theming     — theming contract + conformance kit
  presets/               @hope-ui/presets     — presets (hope = default)
  i18n/                  @hope-ui/i18n        — locale + reading-direction context, message catalogs
  internal-test-utils/   @hope-ui/internal-test-utils — private test harness
apps/
  docs/                  @hope-ui/docs — the end-user documentation website
__internal__/            internal contributor docs — architecture, theming, testing, roadmap
  primitives/<path>/     per-source-file API docs for the primitives kernel (mirrors src path)
  i18n/<path>/           per-source-file API docs for @hope-ui/i18n, incl. one per locale catalog
  internal-test-utils/   per-helper docs for the private test harness
scripts/                 check-coverage-parity.mjs and other repo tooling
.storybook/              Storybook config (shares one Solid compiler config with the tests)
```

## Contributing

Every source file under `packages/*/src/` (except `index.ts`) ships with a matching test;
`@hope-ui/primitives` files also ship a usage `.md` under `__internal__/primitives/`, and
`@hope-ui/components` folders add a colocated Storybook story. (Component and theming API docs live
in the doc website, `apps/docs/`.) This
**Definition of Done** is CI-enforced by `pnpm check:coverage-parity`; the full rules and rationale
are in [`__internal__/definition-of-done.md`](__internal__/definition-of-done.md), [`__internal__/testing.md`](__internal__/testing.md),
and [`CLAUDE.md`](CLAUDE.md). Deeper background lives in [`__internal__/plan.md`](__internal__/plan.md),
[`__internal__/theming.md`](__internal__/theming.md), and [`__internal__/solid-2.0-notes.md`](__internal__/solid-2.0-notes.md).

Commit messages carry the change rationale only — no tool/assistant attribution trailers. Don't add
changesets or bump published-package versions until SolidJS 2.0 ships stable.

## Credits

hope-ui stands on the accessibility research of several projects that got there first. Its behavior
kernel was designed against their public APIs and reasoning, and in a few places adapts their code
directly:

- **[Adobe React Spectrum](https://github.com/adobe/react-spectrum)** (React Aria / React Stately) —
  the ARIA patterns, interaction edge cases, and the press model. Nine files are derived from it.
- **[Base UI](https://github.com/mui/base-ui)** — the compound-component anatomy and the
  anchor-positioning option vocabulary (`side`/`align`/`sideOffset`).
- **[Angular Components](https://github.com/angular/components)** (Angular CDK / Angular Aria) — the
  signal-based decomposition of the list-behavior kernel.
- **[Floating UI](https://github.com/floating-ui/floating-ui)** — overlay positioning, consumed
  directly as `@floating-ui/dom` and structured after the Vue binding.

hope-ui is an independent project and is not affiliated with, sponsored by, or endorsed by any of
them.

## License

MIT — see [`LICENSE.md`](LICENSE.md).

Portions are derived from Apache-2.0 and MIT works and remain under their original licenses;
[`NOTICE.md`](NOTICE.md) lists every one, file by file, and
[`licenses/LICENSE-APACHE-2.0.txt`](licenses/LICENSE-APACHE-2.0.txt) carries the full Apache text.
Published packages ship their own `LICENSE.md`, and `@hope-ui/i18n` and `@hope-ui/primitives` ship a
scoped `NOTICE.md` alongside it.
