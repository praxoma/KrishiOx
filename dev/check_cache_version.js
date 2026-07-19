#!/usr/bin/env node
/* ==========================================================================
   KrishiOx — CI helper: verify CACHE_VERSION was bumped
   Used by .github/workflows/cache-version-guard.yml on every push to main.
   Not a local dev tool — dev/bump_cache.js is the one you run by hand.
   This exists because that manual step is easy to forget (it already
   happened twice), so CI double-checks before a push reaches GitHub Pages.

   Usage: node dev/check_cache_version.js <baseRef> <headRef>
   Exits 0 if no precached file changed, or if CACHE_VERSION was bumped
   alongside one that did. Exits 1 (and prints which files) if a precached
   file changed without a matching CACHE_VERSION bump.
   ========================================================================== */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const [, , baseRef, headRef] = process.argv;
if (!baseRef || !headRef) {
  console.error("Usage: node dev/check_cache_version.js <baseRef> <headRef>");
  process.exit(2);
}

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

const swPath = path.join(__dirname, "..", "sw.js");
const swContent = fs.readFileSync(swPath, "utf8");

const shellMatch = swContent.match(/const APP_SHELL = \[([\s\S]*?)\];/);
if (!shellMatch) {
  console.log("Could not find APP_SHELL in sw.js — skipping check.");
  process.exit(0);
}
// APP_SHELL entries look like "./index.html" — strip the quotes and leading "./".
const appShellFiles = Array.from(shellMatch[1].matchAll(/"\.\/(.*?)"/g))
  .map(function (m) { return m[1]; })
  .filter(Boolean);

const changedFiles = sh("git diff --name-only " + baseRef + " " + headRef)
  .split("\n")
  .filter(Boolean);
const shellChanged = changedFiles.filter(function (f) { return appShellFiles.indexOf(f) !== -1; });

if (shellChanged.length === 0) {
  console.log("No precached files changed — no bump needed.");
  process.exit(0);
}

const versionDiff = sh("git diff " + baseRef + " " + headRef + " -- sw.js");
const versionLineChanged = /^[+-]\s*const CACHE_VERSION/m.test(versionDiff);

if (versionLineChanged) {
  console.log("CACHE_VERSION was already bumped alongside these changes — good.");
  process.exit(0);
}

console.error(
  "These precached files changed without a CACHE_VERSION bump in sw.js:\n  " +
  shellChanged.join("\n  ")
);
process.exit(1);
