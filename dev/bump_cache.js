#!/usr/bin/env node
/* ==========================================================================
   KrishiOx — Cache version bump utility
   Zero-dependency Node script, same philosophy as dev/rebrand.js.

   Every deploy that changes any file in sw.js's APP_SHELL list (any HTML
   page, css/style.css, or js/*.js) needs CACHE_VERSION bumped in sw.js —
   otherwise a returning visitor's already-installed service worker keeps
   serving the old cached copy of that file (cache-first strategy), and only
   a manual browser cache clear fixes it. Bumping the version forces every
   device to discard its old cache and re-fetch everything fresh, the same
   way the auto-update logic in js/main.js already picks it up automatically
   for a returning user (no manual clearing needed) the *next* time they
   forget to bump it.

   This script exists because that bump is easy to forget by hand — run it
   right before every commit that touches a precached file.

   Usage:
     node dev/bump_cache.js
       Increments the version number in sw.js's CACHE_VERSION (e.g.
       "krishiox-v2" -> "krishiox-v3") and prints the new value.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const SW_PATH = path.join(__dirname, "..", "sw.js");
const content = fs.readFileSync(SW_PATH, "utf8");

const re = /const CACHE_VERSION = "([a-z0-9]+)-v(\d+)";/;
const match = content.match(re);

if (!match) {
  console.error("Could not find a CACHE_VERSION line matching the expected \"name-vN\" pattern in sw.js.");
  process.exit(1);
}

const [full, name, num] = match;
const nextVersion = name + "-v" + (parseInt(num, 10) + 1);
const updated = content.replace(full, 'const CACHE_VERSION = "' + nextVersion + '";');

fs.writeFileSync(SW_PATH, updated, "utf8");
console.log("CACHE_VERSION: " + name + "-v" + num + " -> " + nextVersion);
