#!/usr/bin/env node
// Fails CI if a `primitives/` or `components/` source file under packages/*/src is missing a
// matching test file (in a `__tests__/` subfolder beside it) and/or a matching per-file usage
// doc (under `docs/usage/<pkg>/<relative-src-path>/<name>.md`; see REQUIRES_TEST_AND_DOC). This
// is what prevents test/doc coverage from drifting as the number of components grows.
//
// It ALSO fails if any leaf source folder still has flat sprawl — a `*.test.*`, a `.md`, or a
// `__fixtures__/` sitting beside the implementation instead of tucked into `__tests__/` (tests /
// fixtures) or moved to `docs/usage/` (docs). See NO_FLAT_SPRAWL below and CLAUDE.md
// "Leaf source folders stay flat-free".
//
// Every @hope-ui/components source file additionally needs a Storybook story, a
// `Foo.ssr.test.tsx` that really calls `renderToStringAsync()`, and a
// `Foo.browser.test.tsx` that really calls `hydrate()` — the two halves of the SSR round-trip
// the Definition of Done requires. And any browser test that calls `mount()` must also call
// `expectNoA11yViolations()`.
//
// "Really calls" means outside a comment, outside a string, outside an `it.skip`, and not
// merely imported: every one of those loopholes was live at some point, and Dialog exercised
// three of them at once. See docs/testing.md.
//
// One relaxation: files under `packages/primitives/src/internal/` (the advanced/unstable behavior
// kernel, demoted from public API — see docs/plan.md "Recommended architecture") need a test but
// NOT a consumer-facing `.md`. The composed families (dialog/calendar/i18n/modal-backdrop) and
// utils/ still need one. See `isDocExemptSource` below.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const packagesDir = join(repoRoot, "packages");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const EXCLUDED_BASENAMES = new Set(["index"]);
// Only the behavior/UI/contract packages carry the test + .md Definition of Done. The
// `@hope-ui/themes` themes are pure CSS (Tailwind v4 design tokens as `--hope-*` CSS variables), so
// they are exempt — tokens are exercised transitively by the components that consume them.
// `theming` is hand-written contract + runtime, so it's in — but only for test + doc: it renders no
// DOM, so it is deliberately absent from the story / SSR / hydration sets below (those are for
// components a human looks at and that emit hydratable markup).
const REQUIRES_TEST_AND_DOC = new Set(["primitives", "components", "theming"]);
// Packages whose source files must additionally have a `Foo.ssr.test.tsx` that really calls
// `renderToStringAsync`, and a `Foo.browser.test.tsx` that really calls `hydrate`. Those two
// files are the two halves of the SSR → hydrate round-trip, and neither project can do both:
// `ssr` is the only one resolving `solid-js` *and* `@solidjs/web` to their server builds, and
// `browser` is the only one with a DOM. See docs/testing.md.
const REQUIRES_SSR_TEST = new Set(["components"]);
const SSR_TEST_MARKER = "renderToStringAsync";
const REQUIRES_HYDRATION_TEST = new Set(["components"]);
const HYDRATION_TEST_MARKER = "hydrate";

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
 * Blanks the *contents* of comments, string/template literals and regex literals, preserving
 * every character offset. Lets the two checks below reason about code positions only: an
 * `it.skip("hydrates (x)")` stays paren-balanced, and a `renderToStringAsync` mentioned in a
 * comment or inside a string is no longer mistaken for a call.
 *
 * This exists because the SSR requirement used to be `source.includes("renderToStringAsync")`,
 * which `Dialog.browser.test.tsx` satisfied three ways at once — a prose comment, a bare
 * import, and a call inside an `it.skip`. None of them ran.
 *
 * @param {string} source
 */
function blankNonCode(source) {
  const out = source.split("");
  /** The last significant code character, used to tell a regex literal from a division. */
  let previous = "";
  let index = 0;

  /** @param {number} from @param {number} to */
  const blank = (from, to) => {
    for (let i = from; i < to; i++) if (out[i] !== "\n") out[i] = " ";
  };

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "/" && next === "/") {
      const end = source.indexOf("\n", index);
      const stop = end === -1 ? source.length : end;
      blank(index, stop);
      index = stop;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = source.indexOf("*/", index + 2);
      const stop = end === -1 ? source.length : end + 2;
      blank(index, stop);
      index = stop;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      let i = index + 1;
      while (i < source.length) {
        if (source[i] === "\\") i += 2;
        else if (source[i] === char) break;
        else i++;
      }
      blank(index + 1, Math.min(i, source.length));
      index = Math.min(i + 1, source.length);
      previous = char;
      continue;
    }

    // A `/` starting an expression is a regex literal; after a value it is division.
    if (char === "/" && (previous === "" || "(,=:[!&|?{};+-*%~^".includes(previous))) {
      let i = index + 1;
      let inClass = false;
      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
        } else if (source[i] === "[") {
          inClass = true;
          i++;
        } else if (source[i] === "]") {
          inClass = false;
          i++;
        } else if (source[i] === "\n" || (source[i] === "/" && !inClass)) {
          break;
        } else {
          i++;
        }
      }
      blank(index + 1, Math.min(i, source.length));
      index = Math.min(i + 1, source.length);
      previous = "/";
      continue;
    }

    if (!/\s/.test(/** @type {string} */ (char))) previous = /** @type {string} */ (char);
    index++;
  }

  return out.join("");
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
    if (open === -1) continue;

    let depth = 0;
    let i = open;
    for (; i < code.length; i++) {
      if (code[i] === "(") depth++;
      else if (code[i] === ")" && --depth === 0) break;
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
    if (!isSkipped) return true;
  }
  return false;
}

function isStoryFile(path) {
  return /\.stories\.tsx?$/.test(path);
}

/**
 * `@hope-ui/primitives/internal` is the advanced (unstable) behavior kernel — demoted from public
 * API (docs/plan.md "Recommended architecture"). Its files still need a test, but no longer a
 * consumer-facing `.md` contract: nobody is meant to read those as a supported API. The composed
 * public-ish families (dialog, calendar, i18n, modal-backdrop) and the utils/ helpers keep docs.
 * @param {string} pkg @param {string} path
 */
function isDocExemptSource(pkg, path) {
  return pkg === "primitives" && /[/\\]src[/\\]internal[/\\]/.test(path);
}

function isSourceFile(path) {
  if (isTestFile(path) || isStoryFile(path)) return false;
  if (path.endsWith(".d.ts")) return false;
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
  if (!REQUIRES_TEST_AND_DOC.has(pkg)) continue;
  const srcDir = join(packagesDir, pkg, "src");
  let allFiles;
  try {
    allFiles = walk(srcDir);
  } catch {
    continue;
  }

  const sourceFiles = allFiles.filter(isSourceFile);
  const testFiles = allFiles.filter(isTestFile);
  const storyFiles = new Set(allFiles.filter(isStoryFile).map(baseName));

  for (const sourceFile of sourceFiles) {
    const base = baseName(sourceFile);
    const basenameOnly = base.split("/").pop();
    if (EXCLUDED_BASENAMES.has(basenameOnly)) continue;

    // A source file's tests may sit beside it (the primitives' layout) or be tucked into a
    // `__tests__/` subfolder of the same directory (the components' layout — keeping the family
    // folder free of test/fixture visual noise). Both count.
    const testRoots = [base, join(dirname(base), "__tests__", basename(base))];
    const matchingTests = testFiles.filter((t) => {
      const testBase = baseName(t);
      return testRoots.some(
        (root) =>
          testBase === `${root}.test` ||
          testBase === `${root}.ssr.test` ||
          testBase === `${root}.browser.test`,
      );
    });
    const hasTest = matchingTests.length > 0;
    // The per-file usage doc no longer sits beside the source — it lives out of the source tree
    // at `docs/usage/<pkg>/<relative-src-path>/<name>.md`, mirroring the package + src path (so
    // the primitives/ and components/ `dialog` docs never collide). Resolve that exact path and
    // check it exists.
    const docRelDir = relative(srcDir, dirname(sourceFile));
    const expectedDoc = join(repoRoot, "docs/usage", pkg, docRelDir, `${basename(base)}.md`);
    const hasDoc = existsSync(expectedDoc);
    const docRequired = !isDocExemptSource(pkg, sourceFile);

    const relPath = relative(repoRoot, sourceFile);
    if (!hasTest) missing.push(`${relPath} — missing *.test.tsx or *.browser.test.tsx`);
    if (docRequired && !hasDoc) {
      missing.push(`${relPath} — missing matching .md doc at ${relative(repoRoot, expectedDoc)}`);
    }

    if (REQUIRES_SSR_TEST.has(pkg)) {
      // The call must live in the `.ssr.test.*` file, because that is the only Vitest project
      // resolving the server builds. And `hasLiveCall`, not `.includes(...)`: a mention in a
      // comment, a bare import, or a call inside an `it.skip` used to satisfy this.
      const ssrTests = matchingTests.filter(isSsrTestFile);
      const hasSsrTest = ssrTests.some((t) =>
        hasLiveCall(readFileSync(t, "utf8"), SSR_TEST_MARKER),
      );

      if (!hasSsrTest) {
        missing.push(
          `${relPath} — no matching *.ssr.test.tsx calls ${SSR_TEST_MARKER}() outside a comment and outside an it.skip (SSR round-trip test required)`,
        );
      }
    }

    if (REQUIRES_HYDRATION_TEST.has(pkg)) {
      // The other half. Without this, deleting a component's entire hydration suite kept CI
      // green — which is precisely how Dialog's stayed `it.skip`'d for months while CLAUDE.md
      // claimed every component had one.
      const browserTests = matchingTests.filter(isBrowserTestFile);
      const hasHydrationTest = browserTests.some((t) =>
        hasLiveCall(readFileSync(t, "utf8"), HYDRATION_TEST_MARKER),
      );

      if (!hasHydrationTest) {
        missing.push(
          `${relPath} — no matching *.browser.test.tsx calls ${HYDRATION_TEST_MARKER}() outside a comment and outside an it.skip (hydration round-trip test required)`,
        );
      }
    }

    if (REQUIRES_STORY.has(pkg) && !storyFiles.has(`${base}.stories`)) {
      missing.push(`${relPath} — missing matching .stories.tsx`);
    }
  }

  // Checked per test file rather than per source file: what obliges a baseline axe run is
  // rendering DOM, and `mount()` is what renders it.
  for (const browserTest of testFiles.filter(isBrowserTestFile)) {
    const source = readFileSync(browserTest, "utf8");
    if (!hasLiveCall(source, MOUNT_MARKER)) continue;
    if (hasLiveCall(source, A11Y_MARKER)) continue;

    missing.push(
      `${relative(repoRoot, browserTest)} — calls ${MOUNT_MARKER}() but never ${A11Y_MARKER}() (baseline a11y check required)`,
    );
  }
}

// A leaf `src/<name>/` folder must hold only its implementation, its `index.ts`, and (components)
// its `*.stories.tsx`. Tests, `__fixtures__/`, and `__screenshots__/` belong in a `__tests__/`
// subfolder; the per-file usage doc belongs under `docs/usage/`. Anything of those kinds sitting
// flat beside source is the visual noise this layout exists to kill — fail loudly so it can't
// creep back. (`__screenshots__/` is gitignored and only ever regenerates next to a test file, so
// the flat-test rule already covers it — no separate screenshot check is needed.)
const NO_FLAT_SPRAWL = new Set(["primitives", "components", "theming", "internal-test-utils"]);
const underTests = (p) => /[/\\]__tests__[/\\]/.test(p);
const sprawl = [];
for (const pkg of packageDirs) {
  if (!NO_FLAT_SPRAWL.has(pkg)) continue;
  const srcDir = join(packagesDir, pkg, "src");
  let allFiles;
  try {
    allFiles = walk(srcDir);
  } catch {
    continue;
  }
  for (const file of allFiles) {
    if (underTests(file)) continue; // everything under a __tests__/ subtree is where it belongs
    const relPath = relative(repoRoot, file);
    if (isTestFile(file)) {
      sprawl.push(`${relPath} — test file must live in a __tests__/ subfolder`);
    } else if (file.endsWith(".md")) {
      sprawl.push(`${relPath} — usage doc must live under docs/usage/${pkg}/<path>/`);
    } else if (/[/\\]__fixtures__[/\\]/.test(file)) {
      sprawl.push(`${relPath} — __fixtures__/ must live under a __tests__/ subfolder`);
    }
  }
}

if (missing.length > 0 || sprawl.length > 0) {
  if (missing.length > 0) {
    console.error("Definition of Done violated — missing test/doc coverage:\n");
    for (const line of missing) console.error(`  - ${line}`);
  }
  if (sprawl.length > 0) {
    console.error(`${missing.length > 0 ? "\n" : ""}Leaf source folders must stay flat-free:\n`);
    for (const line of sprawl) console.error(`  - ${line}`);
  }
  console.error(`\n${missing.length + sprawl.length} issue(s) found.`);
  process.exit(1);
}

console.log(
  "check:coverage-parity passed — every source file has a test and a doc under docs/usage/ (the " +
    "internal primitives kernel is doc-exempt); every component has a story, an executing " +
    "renderToStringAsync() and an executing hydrate(); every browser test that mounts DOM also " +
    "runs axe; and no leaf source folder has flat test/doc/fixture sprawl.",
);
