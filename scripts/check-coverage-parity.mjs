#!/usr/bin/env node
// Fails CI if the Definition of Done is missing coverage. Enforcement differs by package:
//
//   • `primitives` — PER SOURCE FILE: each source file needs a matching test (in a `__tests__/`
//     subfolder beside it) and a matching usage doc (under
//     `__internal__/<pkg>/<relative-src-path>/<name>.md`). This is the internal kernel, whose
//     per-symbol reference the public doc website (apps/docs) does not cover. See the `else` branch.
//
//   • `theming` — PER SOURCE FILE, TEST ONLY: each source file needs a matching test. Its public
//     API is documented in the doc website (apps/docs), so the per-file usage doc was retired.
//
//   • `components` — PER COMPONENT FOLDER (see PER_FOLDER_DOD): a leaf `src/<name>/` folder is one
//     component, even when its compound parts (Alert, Dialog, …) are split across many files. The
//     folder collectively needs a test, a colocated Storybook `*.stories.tsx`, a `*.ssr.test.tsx`
//     that really calls `renderToStream()`, and a `*.browser.test.tsx` that really calls
//     `hydrate()` (the two halves of the SSR round-trip). Requiring the whole set per part file
//     would only manufacture boilerplate, so it is not required. Component API docs also live in
//     the doc website, so no per-folder usage doc is required.
//
// Any browser test that calls `mount()` must also call `expectNoA11yViolations()` (all packages).
//
// It ALSO fails if any leaf source folder still has flat sprawl — a `*.test.*`, a `.md`, or a
// `__fixtures__/` sitting beside the implementation instead of tucked into `__tests__/` (tests /
// fixtures) or moved to `__internal__/` (primitives usage docs). See NO_FLAT_SPRAWL below and
// CLAUDE.md "Leaf source folders stay flat-free".
//
// "Really calls" means outside a comment, outside a string, outside an `it.skip`, and not
// merely imported: every one of those loopholes was live at some point, and Dialog exercised
// three of them at once. See __internal__/testing.md.
//
// One relaxation: files under `packages/primitives/src/internal/` (the advanced/unstable behavior
// kernel, demoted from public API — see __internal__/plan.md "Recommended architecture") need a
// test but NOT a consumer-facing `.md`. The composed families (dialog/calendar/i18n/modal-backdrop)
// and utils/ still need one. See `isDocExemptSource` below.
//
// Finally, it fails if any usage doc under `__internal__/primitives/` or `__internal__/i18n/` is
// missing its `## Rejected alternatives` section — the architectures that were genuinely on the
// table and lost. That check is keyed off the DOC TREE, not off `REQUIRES_DOC`: an `internal/`
// doc is optional to *write*, but once written it carries the same obligation, and those are the
// rationale-densest files in the repo. See REQUIRES_REJECTED_ALTERNATIVES below. That rule's own
// logic lives in `lib/rejected-alternatives.mjs` — this file is an executable that walks the repo
// and exits, so the rule had to move out of it to be testable on its own.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, sep } from "node:path";
import {
  REJECTED_ALTERNATIVES_HEADING,
  rejectedAlternativesProblem,
} from "./lib/rejected-alternatives.mjs";
import { blankNonCode } from "./lib/source-projection.mjs";

const repoRoot = new URL("..", import.meta.url).pathname;
const packagesDir = join(repoRoot, "packages");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const EXCLUDED_BASENAMES = new Set(["index"]);
// Only the behavior/UI/contract packages carry the test + .md Definition of Done. The
// `@hope-ui/presets` presets are pure CSS (Tailwind v4 design tokens as `--hope-*` CSS variables), so
// they are exempt — tokens are exercised transitively by the components that consume them.
// `theming` is hand-written contract + runtime, so it's in — but only for its test (and the a11y
// loop): it renders no DOM, so it is deliberately absent from the story / SSR / hydration sets
// below (those are for components a human looks at and that emit hydratable markup), and its
// per-file usage doc was retired (documented in the doc website — see REQUIRES_DOC). `i18n` is the
// standalone locale/direction/messages module (lifted out of the primitives kernel); it's headless
// behavior like primitives, so it keeps the per-file test + `.md` treatment.
const REQUIRES_TEST_AND_DOC = new Set(["primitives", "components", "theming", "i18n"]);
// Packages whose source files must ALSO carry an enforced per-file usage doc. The internal
// `primitives` kernel and the headless `i18n` module keep theirs (contributor references for
// behavior, not visual components); the public component/theming API is documented in the doc
// website (apps/docs), so those per-symbol docs were retired. Decoupled from REQUIRES_TEST_AND_DOC
// so a package can require a test without requiring a doc.
const REQUIRES_DOC = new Set(["primitives", "i18n"]);
// Doc trees under `__internal__/` whose every `.md` must record the alternatives that were
// considered and rejected. Deliberately keyed off the doc tree rather than off REQUIRES_DOC: a
// `primitives/src/internal/` file is doc-EXEMPT (isDocExemptSource), but the docs written there
// anyway are the longest and most contested in the repo — `create-floating.md`,
// `create-dismissable.md`, `create-hide-outside.md` — and exempting exactly those would exempt the
// history most likely to be "simplified" back into the bug it was written to avoid. So the rule is
// "a doc that exists carries the section", not "a doc that was required carries the section".
const REQUIRES_REJECTED_ALTERNATIVES = new Set(["primitives", "i18n"]);
// Packages whose source files must additionally have a `Foo.ssr.test.tsx` that really calls
// `renderToStream`, and a `Foo.browser.test.tsx` that really calls `hydrate`. Those two
// files are the two halves of the SSR → hydrate round-trip, and neither project can do both:
// `ssr` is the only one resolving `solid-js` *and* `@solidjs/web` to their server builds, and
// `browser` is the only one with a DOM. See __internal__/testing.md.
const REQUIRES_SSR_TEST = new Set(["components"]);
const SSR_TEST_MARKER = "renderToStream";
const REQUIRES_HYDRATION_TEST = new Set(["components"]);
// A component's browser test satisfies this by calling `hydrate()` directly, or the shared
// `hydrateFixture()` helper (`@hope-ui/internal-test-utils`), which calls `hydrate()` internally.
// The `hasLiveCall` regex `\bhydrate\s*\(` does *not* match `hydrateFixture(`, so both spellings
// are listed explicitly.
const HYDRATION_TEST_MARKERS = ["hydrate", "hydrateFixture"];

// Any browser test that puts real DOM on the page must run a baseline axe check on it.
// "Puts real DOM on the page" is not decidable in general, but `mount()` is exactly the harness
// that does it — so calling one obliges you to call the other. This lets a test that renders
// nothing (`solid-contract.browser.test.tsx`, which only pokes at `@solidjs/web`'s exports) stay
// exempt without an allowlist to maintain.
const MOUNT_MARKER = "mount";
const A11Y_MARKER = "expectNoA11yViolations";
// Packages whose source files must additionally have a colocated Storybook story.
// Components are the things a human needs to look at; pure primitives are not.
const REQUIRES_STORY = new Set(["components"]);
// Packages whose Definition-of-Done set (a test, a doc, a story, an SSR test, and a hydration test)
// is enforced PER COMPONENT FOLDER rather than per source file. A compound component (Alert, Dialog,
// …) splits its parts across many files in one leaf `src/<name>/` folder; they are collectively one
// component, exercised by one shared test suite / doc / story, so requiring the whole set per part
// file would only manufacture boilerplate. `primitives`/`theming` stay per-file (a test + a doc each).
const PER_FOLDER_DOD = new Set(["components"]);
// Leaf folders directly under a PER_FOLDER_DOD package's `src/` that hold shared **resources**, not a
// component: they ship no hydratable UI of their own — just reusable assets (the built-in icon set)
// imported by the real components — so they carry no per-folder test/story/SSR/hydration set. The
// flat-free rule (NO_FLAT_SPRAWL) still applies, so they can hold only source + `index.ts`. Keyed by
// package so the exemption can't leak across packages.
const RESOURCE_DIRS = { components: new Set(["icons"]) };

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function isTestFile(path) {
  return /\.(test|ssr\.test|browser\.test)\.tsx?$/.test(path);
}

function isSsrTestFile(path) {
  return /\.ssr\.test\.tsx?$/.test(path);
}

function isBrowserTestFile(path) {
  return /\.browser\.test\.tsx?$/.test(path);
}

/**
 * Character ranges covered by a skipped block — `it.skip(...)`, `test.skip(...)`,
 * `describe.skip(...)`, and their `.only`-style `xit`/`xdescribe` spellings.
 * @param {string} code A `blankNonCode` result, so parens inside strings can't confuse it.
 * @returns {Array<[number, number]>}
 */
function skippedRanges(code) {
  const ranges = [];
  const skipCall = /\b(?:it|test|describe)\.skip\s*\(|\b(?:xit|xtest|xdescribe)\s*\(/g;

  for (const match of code.matchAll(skipCall)) {
    const open = code.indexOf("(", match.index);
    if (open === -1) {
      continue;
    }

    let depth = 0;
    let i = open;
    for (; i < code.length; i++) {
      if (code[i] === "(") {
        depth++;
      } else if (code[i] === ")" && --depth === 0) {
        break;
      }
    }
    ranges.push([match.index, Math.min(i + 1, code.length)]);
  }

  return ranges;
}

/**
 * Whether `callee` is *invoked* somewhere the test runner will actually reach: not in a
 * comment, not inside a string, not inside a skipped block — and not merely imported.
 *
 * None of those exclusions is hypothetical. Before this check was tightened,
 * `Dialog.browser.test.tsx` satisfied the SSR requirement with a prose comment, a bare import,
 * and a call inside an `it.skip` — while `Dialog.tsx` had no executing SSR test at all.
 *
 * @param {string} source
 * @param {string} callee
 */
function hasLiveCall(source, callee) {
  const code = blankNonCode(source);
  const skipped = skippedRanges(code);
  const call = new RegExp(`\\b${callee}\\s*\\(`, "g");

  for (const match of code.matchAll(call)) {
    const index = match.index;
    const isSkipped = skipped.some(([start, end]) => index >= start && index < end);
    if (!isSkipped) {
      return true;
    }
  }
  return false;
}

function isStoryFile(path) {
  return /\.stories\.tsx?$/.test(path);
}

/**
 * `@hope-ui/primitives/internal` is the advanced (unstable) behavior kernel — demoted from public
 * API (__internal__/plan.md "Recommended architecture"). Its files still need a test, but no longer a
 * consumer-facing `.md` contract: nobody is meant to read those as a supported API. The composed
 * public-ish families (dialog, calendar, i18n, modal-backdrop) and the utils/ helpers keep docs.
 * @param {string} pkg @param {string} path
 */
function isDocExemptSource(pkg, path) {
  return pkg === "primitives" && /[/\\]src[/\\]internal[/\\]/.test(path);
}

/** Whether a path lives inside a `__tests__/` subtree (tests + their support modules + fixtures). */
const underTests = (p) => /[/\\]__tests__[/\\]/.test(p);

function isSourceFile(path) {
  if (isTestFile(path) || isStoryFile(path)) {
    return false;
  }
  if (path.endsWith(".d.ts")) {
    return false;
  }
  // A non-test `.ts(x)` under `__tests__/` (e.g. a `*.ssr-entry.tsx` render entry shared by a
  // component's ssr + browser tests and the hydration-fixture bridge) is test *support*, not
  // shippable source: tsdown only builds the `hope.entries` files, so nothing here ever reaches
  // `dist/`. Requiring it to carry its own test/doc/story/SSR/hydration set would be nonsense — it
  // has no public API. The flat-free rule below still keeps such files inside `__tests__/`.
  if (underTests(path)) {
    return false;
  }
  return SOURCE_EXTENSIONS.has(extname(path));
}

function baseName(path) {
  const name = path.slice(0, path.length - extname(path).length);
  return name;
}

let packageDirs;
try {
  packageDirs = readdirSync(packagesDir).filter((entry) =>
    statSync(join(packagesDir, entry)).isDirectory(),
  );
} catch {
  console.log("No packages/ directory yet — nothing to check.");
  process.exit(0);
}

const missing = [];

for (const pkg of packageDirs) {
  if (!REQUIRES_TEST_AND_DOC.has(pkg)) {
    continue;
  }
  const srcDir = join(packagesDir, pkg, "src");
  let allFiles;
  try {
    allFiles = walk(srcDir);
  } catch {
    continue;
  }

  const sourceFiles = allFiles.filter(isSourceFile);
  const testFiles = allFiles.filter(isTestFile);
  const storyFiles = allFiles.filter(isStoryFile);

  if (PER_FOLDER_DOD.has(pkg)) {
    // @hope-ui/components: the full Definition-of-Done set — a test, a doc, a story, an SSR test, and
    // a hydration test — is enforced PER COMPONENT FOLDER, not per source file. A compound component
    // (Alert, Dialog, …) splits its parts across many files in one leaf `src/<name>/` folder; they
    // are collectively one component, exercised by one shared test suite / doc / story. (Leaf folders
    // still stay flat-free via NO_FLAT_SPRAWL below, and each browser test that mounts still runs axe.)
    const componentDirs = new Set();
    const resourceDirs = new Set([...(RESOURCE_DIRS[pkg] ?? [])].map((name) => join(srcDir, name)));
    for (const f of sourceFiles) {
      // A folder of only `index.ts` is a barrel, not a component; a folder with any other source file
      // is a component folder — unless it's a declared shared-resource folder (e.g. `icons/`), which
      // ships assets, not a hydratable component, so it carries no per-folder DoD set.
      if (EXCLUDED_BASENAMES.has(basename(baseName(f)))) {
        continue;
      }
      const dir = dirname(f);
      if (resourceDirs.has(dir)) {
        continue;
      }
      componentDirs.add(dir);
    }

    for (const dir of componentDirs) {
      const label = relative(repoRoot, dir);
      // Tests live in the folder's `__tests__/` subtree; any there counts toward the whole folder.
      const folderTests = testFiles.filter((t) => t.startsWith(`${dir}${sep}`) && underTests(t));

      const hasTest = folderTests.length > 0;
      const hasStory = storyFiles.some((s) => dirname(s) === dir);
      // `hasLiveCall`, not `.includes(...)`: a mention in a comment, a bare import, or a call inside
      // an `it.skip` must not satisfy the SSR / hydration round-trip requirements.
      const hasSsr = folderTests
        .filter(isSsrTestFile)
        .some((t) => hasLiveCall(readFileSync(t, "utf8"), SSR_TEST_MARKER));
      const hasHydration = folderTests.filter(isBrowserTestFile).some((t) => {
        const source = readFileSync(t, "utf8");
        return HYDRATION_TEST_MARKERS.some((marker) => hasLiveCall(source, marker));
      });

      if (!hasTest) {
        missing.push(`${label} — component folder has no test in a __tests__/ subfolder`);
      }
      if (REQUIRES_STORY.has(pkg) && !hasStory) {
        missing.push(`${label} — component folder has no colocated *.stories.tsx`);
      }
      if (REQUIRES_SSR_TEST.has(pkg) && !hasSsr) {
        missing.push(
          `${label} — no *.ssr.test.tsx in the folder calls ${SSR_TEST_MARKER}() outside a comment and outside an it.skip (SSR round-trip test required)`,
        );
      }
      if (REQUIRES_HYDRATION_TEST.has(pkg) && !hasHydration) {
        missing.push(
          `${label} — no *.browser.test.tsx in the folder calls ${HYDRATION_TEST_MARKERS.join("() or ")}() outside a comment and outside an it.skip (hydration round-trip test required)`,
        );
      }
    }
  } else {
    // primitives / theming: a test + a doc PER source file (they render no story / SSR / hydration).
    for (const sourceFile of sourceFiles) {
      const base = baseName(sourceFile);
      const basenameOnly = base.split("/").pop();
      if (EXCLUDED_BASENAMES.has(basenameOnly)) {
        continue;
      }

      // A source file's tests may sit beside it (the primitives' layout) or be tucked into a
      // `__tests__/` subfolder of the same directory. Both count. Every source file — including one
      // in a kept sub-folder (`calendar/utils/`, `i18n/locales/`, `theming/recipes/`) — keeps its
      // test in its OWN directory's `__tests__/`, so same-directory matching is all that's needed.
      const testRoots = [base, join(dirname(base), "__tests__", basename(base))];
      const hasTest = testFiles.some((t) => {
        const testBase = baseName(t);
        return testRoots.some(
          (root) =>
            testBase === `${root}.test` ||
            testBase === `${root}.ssr.test` ||
            testBase === `${root}.browser.test`,
        );
      });
      // The per-file usage doc lives out of the source tree at
      // `__internal__/<pkg>/<relative-src-path>/<name>.md`, mirroring the package + src path.
      // Only REQUIRES_DOC packages (the primitives kernel) enforce it; theming is test-only.
      const docRelDir = relative(srcDir, dirname(sourceFile));
      const expectedDoc = join(repoRoot, "__internal__", pkg, docRelDir, `${basename(base)}.md`);
      const hasDoc = existsSync(expectedDoc);
      const docRequired = REQUIRES_DOC.has(pkg) && !isDocExemptSource(pkg, sourceFile);

      const relPath = relative(repoRoot, sourceFile);
      if (!hasTest) {
        missing.push(`${relPath} — missing *.test.tsx or *.browser.test.tsx`);
      }
      if (docRequired && !hasDoc) {
        missing.push(`${relPath} — missing matching .md doc at ${relative(repoRoot, expectedDoc)}`);
      }
    }
  }

  // Checked per test file rather than per source file: what obliges a baseline axe run is
  // rendering DOM, and `mount()` is what renders it.
  for (const browserTest of testFiles.filter(isBrowserTestFile)) {
    const source = readFileSync(browserTest, "utf8");
    if (!hasLiveCall(source, MOUNT_MARKER)) {
      continue;
    }
    if (hasLiveCall(source, A11Y_MARKER)) {
      continue;
    }

    missing.push(
      `${relative(repoRoot, browserTest)} — calls ${MOUNT_MARKER}() but never ${A11Y_MARKER}() (baseline a11y check required)`,
    );
  }
}

// Every usage doc records not just what its primitive does, but which other shapes were on the
// table and what happened when they lost. Without it the reasoning survives only in commit
// messages, and a maintainer reading a strange-looking primitive assumes the strangeness is
// accidental and "simplifies" it back into the bug it was written to avoid. See
// __internal__/definition-of-done.md "Rejected alternatives".
const undocumentedAlternatives = [];
for (const pkg of REQUIRES_REJECTED_ALTERNATIVES) {
  const docDir = join(repoRoot, "__internal__", pkg);
  let docFiles;
  try {
    docFiles = walk(docDir).filter((f) => f.endsWith(".md"));
  } catch {
    continue;
  }
  for (const doc of docFiles) {
    const problem = rejectedAlternativesProblem(readFileSync(doc, "utf8"));
    if (problem) {
      undocumentedAlternatives.push(`${relative(repoRoot, doc)} — ${problem}`);
    }
  }
}

// A leaf `src/<name>/` folder must hold only its implementation, its `index.ts`, and (components)
// its `*.stories.tsx`. Tests, `__fixtures__/`, and `__screenshots__/` belong in a `__tests__/`
// subfolder; any usage doc belongs under `__internal__/`. Anything of those kinds sitting
// flat beside source is the visual noise this layout exists to kill — fail loudly so it can't
// creep back. (`__screenshots__/` is gitignored and only ever regenerates next to a test file, so
// the flat-test rule already covers it — no separate screenshot check is needed.)
const NO_FLAT_SPRAWL = new Set([
  "primitives",
  "components",
  "theming",
  "internal-test-utils",
  "i18n",
]);
const sprawl = [];
for (const pkg of packageDirs) {
  if (!NO_FLAT_SPRAWL.has(pkg)) {
    continue;
  }
  const srcDir = join(packagesDir, pkg, "src");
  let allFiles;
  try {
    allFiles = walk(srcDir);
  } catch {
    continue;
  }
  for (const file of allFiles) {
    if (underTests(file)) {
      continue; // everything under a __tests__/ subtree is where it belongs
    }
    const relPath = relative(repoRoot, file);
    if (isTestFile(file)) {
      sprawl.push(`${relPath} — test file must live in a __tests__/ subfolder`);
    } else if (file.endsWith(".md")) {
      sprawl.push(
        `${relPath} — .md must not sit flat beside source (primitives usage docs live under __internal__/primitives/<path>/)`,
      );
    } else if (/[/\\]__fixtures__[/\\]/.test(file)) {
      sprawl.push(`${relPath} — __fixtures__/ must live under a __tests__/ subfolder`);
    }
  }
}

const failures = [
  ["Definition of Done violated — missing test/doc coverage:", missing],
  ["Leaf source folders must stay flat-free:", sprawl],
  [
    `Every usage doc records the alternatives it rejected (\`## ${REJECTED_ALTERNATIVES_HEADING}\`):`,
    undocumentedAlternatives,
  ],
];
const total = failures.reduce((sum, [, lines]) => sum + lines.length, 0);

if (total > 0) {
  let printedAnySection = false;
  for (const [headline, lines] of failures) {
    if (lines.length === 0) {
      continue;
    }
    console.error(`${printedAnySection ? "\n" : ""}${headline}\n`);
    for (const line of lines) {
      console.error(`  - ${line}`);
    }
    printedAnySection = true;
  }
  console.error(`\n${total} issue(s) found.`);
  process.exit(1);
}

console.log(
  "check:coverage-parity passed — every primitives source file has a test and a doc under " +
    "__internal__/ (the internal-kernel src/internal/ files are doc-exempt); every theming source " +
    "file has a test; every component FOLDER has a test, a story, an executing renderToStream() " +
    "and an executing hydrate(); every browser test that mounts DOM also runs axe; every usage doc " +
    "under __internal__/primitives|i18n records its rejected alternatives; and no leaf source " +
    "folder has flat test/doc/fixture sprawl.",
);
