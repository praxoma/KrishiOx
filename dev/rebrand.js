#!/usr/bin/env node
/* ==========================================================================
   GOSPOLO — Rebrand utility
   Zero-dependency Node script (matches the project's "no build step"
   philosophy — this is a one-off dev tool, not something the site needs
   at runtime, same idea as dev/generate_icons.py).

   Everything JS-rendered (header, footer, WhatsApp messages, toasts)
   already reads the brand name from js/config.js, so that part never
   needs this script. But <title>, meta description, canonical URLs, Open
   Graph/Twitter tags, JSON-LD, and manifest.json are static text baked
   into each HTML file on purpose — link-preview bots (WhatsApp, Facebook,
   Twitter) and some crawlers don't execute JavaScript, so those tags have
   to be real static HTML, not JS-injected. This script is what keeps that
   static text in sync in one command instead of hand-editing 6+ files.

   Usage:
     node dev/rebrand.js --status
       Show the brand name and base URL currently baked into the project.

     node dev/rebrand.js --name "AgriSetu" --initials "AS"
       Rename the platform everywhere (title tags, OG tags, JSON-LD,
       manifest.json, js/config.js, README, footer/header via config.js).

     node dev/rebrand.js --github-pages yourGithubUser/your-repo
       Point all canonical/OG/sitemap/robots URLs at the free GitHub Pages
       URL and remove any CNAME file. Use this while testing, before a
       domain is decided.

     node dev/rebrand.js --domain example.in
       Point all canonical/OG/sitemap/robots URLs at a real custom domain
       and write the CNAME file GitHub Pages needs. Only run this once you
       actually own the domain and have DNS pointed at GitHub Pages (see
       README "Custom domain").

     node dev/rebrand.js --go-live
       Remove the temporary <meta name="robots" content="noindex..."> tag
       (and its marker comment) from every page — do this once the final
       name + domain are live and you actually want Google to index it.

   Flags combine freely, e.g.:
     node dev/rebrand.js --name "AgriSetu" --initials "AS" --domain agrisetu.in --go-live
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TEXT_FILES = [
  "index.html", "about.html", "contact.html", "services.html", "booking.html", "partners.html", "offline.html",
  "manifest.json", "sitemap.xml", "robots.txt", "README.md",
  "js/config.js", "js/main.js", "js/booking.js", "js/icons.js", "sw.js"
];

function readFile(rel) {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
}

function writeFile(rel, content) {
  fs.writeFileSync(path.join(ROOT, rel), content, "utf8");
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) { args[key] = next; i++; }
    else { args[key] = true; }
  }
  return args;
}

function detectCurrentName() {
  const cfg = readFile("js/config.js") || "";
  const m = cfg.match(/appName:\s*"([^"]+)"/);
  return m ? m[1] : "GOSPOLO";
}

function detectCurrentBase() {
  const idx = readFile("index.html") || "";
  const m = idx.match(/<link rel="canonical" href="https:\/\/([^"]+?)\/?">/);
  return m ? m[1] : null;
}

function replaceAcross(oldStr, newStr) {
  if (!oldStr || oldStr === newStr) return 0;
  let filesTouched = 0;
  TEXT_FILES.forEach(function (rel) {
    const content = readFile(rel);
    if (content === null) return;
    if (!content.includes(oldStr)) return;
    const count = content.split(oldStr).length - 1;
    writeFile(rel, content.split(oldStr).join(newStr));
    console.log("  " + rel + ": " + count + " occurrence(s) of \"" + oldStr + "\" -> \"" + newStr + "\"");
    filesTouched++;
  });
  return filesTouched;
}

function removeNoindex() {
  let filesTouched = 0;
  TEXT_FILES.filter(function (f) { return f.endsWith(".html"); }).forEach(function (rel) {
    const content = readFile(rel);
    if (content === null) return;
    const re = /<!-- TEMP while testing on github\.io[^\n]*-->\r?\n<meta name="robots" content="noindex, follow">\r?\n/;
    if (!re.test(content)) return;
    writeFile(rel, content.replace(re, ""));
    console.log("  " + rel + ": removed noindex");
    filesTouched++;
  });
  return filesTouched;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const currentName = detectCurrentName();
  const currentBase = detectCurrentBase();

  if (args.status || Object.keys(args).length === 0) {
    console.log("Current brand name : " + currentName);
    console.log("Current base URL    : " + (currentBase ? "https://" + currentBase : "(none found)"));
    console.log("CNAME file          : " + (readFile("CNAME") ? readFile("CNAME").trim() : "(not present — using GitHub Pages default URL)"));
    console.log("\nRun with --name / --initials / --domain / --github-pages / --go-live. See the comment header in this file for examples.");
    return;
  }

  if (args.name) {
    console.log("Renaming \"" + currentName + "\" -> \"" + args.name + "\"...");
    replaceAcross(currentName, args.name);
  }

  if (args.initials) {
    const cfg = readFile("js/config.js");
    const updated = cfg.replace(/brandInitials:\s*"[^"]*"/, 'brandInitials: "' + args.initials + '"');
    writeFile("js/config.js", updated);
    console.log("Set brandInitials to \"" + args.initials + "\" in js/config.js");
  }

  if (args.domain) {
    console.log("Switching base URL to custom domain \"" + args.domain + "\"...");
    if (currentBase) replaceAcross(currentBase, args.domain);
    writeFile("CNAME", args.domain + "\n");
    console.log("  Wrote CNAME with \"" + args.domain + "\"");
    console.log("  Reminder: point DNS at GitHub Pages and set the custom domain in Settings -> Pages (see README).");
  } else if (args["github-pages"]) {
    const ghBase = args["github-pages"].includes("/")
      ? args["github-pages"].split("/")[0] + ".github.io/" + args["github-pages"].split("/")[1]
      : args["github-pages"] + ".github.io";
    console.log("Switching base URL to GitHub Pages \"" + ghBase + "\"...");
    if (currentBase) replaceAcross(currentBase, ghBase);
    const cnamePath = path.join(ROOT, "CNAME");
    if (fs.existsSync(cnamePath)) {
      fs.unlinkSync(cnamePath);
      console.log("  Removed CNAME (no custom domain while testing)");
    }
  }

  if (args["go-live"]) {
    console.log("Removing temporary noindex tags...");
    removeNoindex();
  }

  console.log("\nDone. Review the diff (git status / git diff), then commit and push.");
}

main();
