#!/usr/bin/env node
// Fails CI if any source file under packages/*/src is missing a matching test file
// and/or a matching .md doc file. This is what prevents test/doc coverage from
// drifting as the number of components grows. Also requires an SSR round-trip test
// reference (a `renderToStringAsync` call) and a Storybook story for every
// @solid-zero/components source file — per CLAUDE.md's Definition of Done, components
// (unlike pure primitives with no DOM output) need both — see docs/plan.md Item 3.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const packagesDir = join(repoRoot, "packages");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const EXCLUDED_BASENAMES = new Set(["index"]);
// Packages whose source files must additionally have an SSR round-trip test
// (a `renderToStringAsync` reference in one of their matching test files).
const REQUIRES_SSR_TEST = new Set(["components"]);
const SSR_TEST_MARKER = "renderToStringAsync";
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
  return /\.(test|browser\.test)\.tsx?$/.test(path);
}

/**
 * Blanks the *contents* of comments, string/template literals and regex literals, preserving
 * every character offset. Lets the two checks below reason about code positions only: an
 * `it.skip("hydrates (x)")` stays paren-balanced, and a `renderToStringAsync` mentioned in a
 * comment or inside a string is no longer mistaken for a call.
 *
 * This exists because the SSR requirement used to be `source.includes("renderToStringAsync")`,
 * and `Dialog.browser.test.tsx` satisfied it twice over — once in a prose comment, once
 * inside an `it.skip`. Neither runs.
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
 * The "merely imported" case is not hypothetical: `Dialog.browser.test.tsx` imports
 * `renderToStringAsync` for its `it.skip`'d hydration test, so requiring the bare name would
 * still pass on a file whose only real call was deleted.
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
  const srcDir = join(packagesDir, pkg, "src");
  let allFiles;
  try {
    allFiles = walk(srcDir);
  } catch {
    continue;
  }

  const sourceFiles = allFiles.filter(isSourceFile);
  const testFiles = allFiles.filter(isTestFile);
  const docFiles = new Set(allFiles.filter((f) => f.endsWith(".md")).map(baseName));
  const storyFiles = new Set(allFiles.filter(isStoryFile).map(baseName));

  for (const sourceFile of sourceFiles) {
    const base = baseName(sourceFile);
    const basenameOnly = base.split("/").pop();
    if (EXCLUDED_BASENAMES.has(basenameOnly)) continue;

    const matchingTests = testFiles.filter((t) => {
      const testBase = baseName(t);
      return testBase === `${base}.test` || testBase === `${base}.browser.test`;
    });
    const hasTest = matchingTests.length > 0;
    const hasDoc = docFiles.has(base);

    const relPath = relative(repoRoot, sourceFile);
    if (!hasTest) missing.push(`${relPath} — missing *.test.tsx or *.browser.test.tsx`);
    if (!hasDoc) missing.push(`${relPath} — missing matching .md doc`);

    if (hasTest && REQUIRES_SSR_TEST.has(pkg)) {
      // `hasLiveCall`, not `.includes(...)`: a mention in a comment, an import, or a call
      // inside an `it.skip` used to satisfy this — and `Dialog.browser.test.tsx` has all three.
      const hasSsrTest = matchingTests.some((t) =>
        hasLiveCall(readFileSync(t, "utf8"), SSR_TEST_MARKER),
      );
      if (!hasSsrTest) {
        missing.push(
          `${relPath} — no matching test calls ${SSR_TEST_MARKER}() outside a comment and outside an it.skip (SSR round-trip test required)`,
        );
      }
    }

    if (REQUIRES_STORY.has(pkg) && !storyFiles.has(`${base}.stories`)) {
      missing.push(`${relPath} — missing matching .stories.tsx`);
    }
  }
}

if (missing.length > 0) {
  console.error("Definition of Done violated — missing test/doc coverage:\n");
  for (const line of missing) console.error(`  - ${line}`);
  console.error(`\n${missing.length} issue(s) found.`);
  process.exit(1);
}

console.log(
  "check:coverage-parity passed — every source file has a test and a doc, and every component has a story.",
);
