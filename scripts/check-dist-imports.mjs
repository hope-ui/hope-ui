#!/usr/bin/env node
// Fails CI if any built `packages/*/dist/**/*.js` imports a client-only DOM helper from
// `@solidjs/web`. One grep, two jobs.
//
// 1. It enforces the undocumented invariant SSR silently depends on: **no source file may
//    contain a literal host JSX element** (`<div>`, `<span>`, an SVG arrow, a
//    visually-hidden label). `vite-plugin-solid` is configured with neither `generate` nor
//    `hydratable`, i.e. `generate: "dom"`, which compiles a literal host element into a
//    module-scope `_$template()` call plus `_$insert()`. `@solidjs/web`'s **server** build
//    exports `template`/`insert`/`spread`/`setAttribute` as `notSup` throwers
//    ("Client-only API called on the server side"), and `_$template()` runs at module scope
//    — so one literal `<div>` in a component throws *at import* under SSR.
//
//    It works today only because every host element routes through
//    `renderElement` → `<Dynamic>` → `createComponent`. Server-side `dynamic()` calls
//    `ssrElement(component, props, undefined, true)`; client-side it calls
//    `sharedConfig.hydrating ? getNextElement() : createElement(...)`. `Dynamic` bridges the
//    two builds at runtime, so the compile mode never matters.
//
// 2. It is the tripwire for a compiler-preset regression. `babel-preset-solid@1.x` emits
//    `use` and `addEventListener`, names `@solidjs/web` 2.0 renamed to `ref` and `addEvent`.
//    Any toolchain swap that silently pulls a 1.x preset back in (see
//    `docs/migration-2.0-stable.md` §5, the deferred `tsdown` + `unplugin-solid` migration)
//    ships a `dist/` that cannot even be imported, with the whole pipeline green.
//
// Pinned by `packages/primitives/src/solid-contract.test.tsx` and its browser counterpart.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const packagesDir = join(repoRoot, "packages");

/**
 * Client-only helpers a `generate: "dom"` build emits for a literal host JSX element, plus
 * the two names a stale `babel-preset-solid@1.x` would emit and 2.0's `@solidjs/web` no
 * longer exports at all.
 */
const FORBIDDEN_IMPORTS = new Set([
  "template",
  "insert",
  "spread",
  "setAttribute",
  "use",
  "addEventListener",
]);

const SOLID_WEB_IMPORT = /import\s*\{([^}]*)\}\s*from\s*["']@solidjs\/web["']/g;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) files.push(...walk(fullPath));
    else if (fullPath.endsWith(".js")) files.push(fullPath);
  }
  return files;
}

/**
 * `import { Dynamic as s, createComponent as c } from "@solidjs/web"` — the build minifies
 * local names, so only the specifier *before* an `as` identifies the export.
 * @param {string} clause
 */
function importedNames(clause) {
  return clause
    .split(",")
    .map((specifier) =>
      specifier
        .trim()
        .split(/\s+as\s+/)[0]
        ?.trim(),
    )
    .filter((name) => name !== undefined && name.length > 0);
}

let packageDirs;
try {
  packageDirs = readdirSync(packagesDir).filter((entry) =>
    statSync(join(packagesDir, entry)).isDirectory(),
  );
} catch {
  console.error("No packages/ directory — run this after `pnpm build`.");
  process.exit(1);
}

const violations = [];
let checkedFiles = 0;

for (const pkg of packageDirs) {
  const distDir = join(packagesDir, pkg, "dist");
  let files;
  try {
    files = walk(distDir);
  } catch {
    // A package with no `dist/` is either private (internal-test-utils) or unbuilt.
    continue;
  }

  for (const file of files) {
    checkedFiles++;
    const source = readFileSync(file, "utf8");

    for (const match of source.matchAll(SOLID_WEB_IMPORT)) {
      const clause = match[1];
      if (clause === undefined) continue;

      for (const name of importedNames(clause)) {
        if (!FORBIDDEN_IMPORTS.has(name)) continue;
        violations.push(`${relative(repoRoot, file)} — imports \`${name}\` from @solidjs/web`);
      }
    }
  }
}

if (checkedFiles === 0) {
  console.error("check:dist-imports found no built files. Run `pnpm build` first.");
  process.exit(1);
}

if (violations.length > 0) {
  console.error(
    "check:dist-imports failed — a built file imports a client-only @solidjs/web helper.\n",
  );
  for (const line of violations) console.error(`  - ${line}`);
  console.error(
    "\nThis breaks SSR: those helpers are throwing stubs in @solidjs/web's server build, and " +
      "`_$template()` runs at module scope, so the component throws at import.\n" +
      "Most likely cause: a literal host JSX element (`<div>`, `<span>`, an SVG arrow) in a " +
      "component. Route it through `renderElement` instead — see CLAUDE.md, " +
      '"No component may write a literal host JSX element".\n' +
      "If instead you see `use` or `addEventListener`, a `babel-preset-solid@1.x` has crept " +
      "back into the compiler pipeline — see docs/migration-2.0-stable.md §5.",
  );
  process.exit(1);
}

console.log(
  `check:dist-imports passed — ${checkedFiles} built file(s), no client-only @solidjs/web imports.`,
);
