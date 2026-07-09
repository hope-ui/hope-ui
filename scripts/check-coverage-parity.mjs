#!/usr/bin/env node
// Fails CI if any source file under packages/*/src is missing a matching test file
// and/or a matching .md doc file. This is what prevents the "24 of ~59 components
// have no test" drift Kobalte has and the "zero tests anywhere" state Corvu has.
import { readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
const packagesDir = join(repoRoot, "packages");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const EXCLUDED_BASENAMES = new Set(["index"]);

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

function isSourceFile(path) {
  if (isTestFile(path)) return false;
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

  for (const sourceFile of sourceFiles) {
    const base = baseName(sourceFile);
    const basenameOnly = base.split("/").pop();
    if (EXCLUDED_BASENAMES.has(basenameOnly)) continue;

    const hasTest = testFiles.some((t) => {
      const testBase = baseName(t);
      return testBase === `${base}.test` || testBase === `${base}.browser.test`;
    });
    const hasDoc = docFiles.has(base);

    const relPath = relative(repoRoot, sourceFile);
    if (!hasTest) missing.push(`${relPath} — missing *.test.tsx or *.browser.test.tsx`);
    if (!hasDoc) missing.push(`${relPath} — missing matching .md doc`);
  }
}

if (missing.length > 0) {
  console.error("Definition of Done violated — missing test/doc coverage:\n");
  for (const line of missing) console.error(`  - ${line}`);
  console.error(`\n${missing.length} issue(s) found.`);
  process.exit(1);
}

console.log("check:coverage-parity passed — every source file has a test and a doc.");
