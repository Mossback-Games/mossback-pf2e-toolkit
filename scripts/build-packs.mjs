// Builds the macro compendium from src/macros/*.js.
//
// Each .js file is one macro. Its JSDoc-style header supplies the metadata
// (@name, @img, @description, ...). The file's code becomes the macro command.
// IDs are derived from the file name, so a macro keeps the same ID across
// releases and existing world links to it don't break. Renaming a file
// therefore gives the macro a new ID.
//
// Usage:
//   npm run build    -> writes packs/macros (LevelDB) for Foundry
//   npm run check    -> validates headers only, writes nothing

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src", "macros");
const STAGING = path.join(ROOT, "build", "macros");
const OUT = path.join(ROOT, "packs", "macros");
const CHECK_ONLY = process.argv.includes("--check");

const REQUIRED = ["name", "img", "description", "foundry"];

/** Stable 16-character Foundry ID from a file name. */
function stableId(file) {
  return createHash("sha256").update(`mossback-macro:${file}`).digest("hex").slice(0, 16);
}

/** Parse the leading /** ... *\/ block into { tag: value }. */
function parseHeader(source, file) {
  const match = source.match(/^\s*\/\*\*([\s\S]*?)\*\//);
  if (!match) throw new Error(`${file}: missing /** header */ block`);
  const tags = {};
  for (const line of match[1].split(/\r?\n/)) { // Windows checkouts use CRLF
    const m = line.match(/^\s*\*?\s*@(\w+)\s+(.*)$/);
    if (m) tags[m[1]] = m[2].trim();
  }
  const missing = REQUIRED.filter((t) => !tags[t]);
  if (missing.length) throw new Error(`${file}: header is missing @${missing.join(", @")}`);
  return tags;
}

async function main() {
  const files = (await readdir(SRC)).filter((f) => f.endsWith(".js") && !f.startsWith("_")).sort();
  if (!files.length) throw new Error("No macros found in src/macros");

  const docs = [];
  const seenNames = new Set();
  for (const file of files) {
    const source = await readFile(path.join(SRC, file), "utf8");
    const meta = parseHeader(source, file);
    if (seenNames.has(meta.name)) throw new Error(`${file}: duplicate macro name "${meta.name}"`);
    seenNames.add(meta.name);

    const _id = stableId(file);
    docs.push({
      file,
      doc: {
        _id,
        _key: `!macros!${_id}`,
        name: meta.name,
        type: "script",
        img: meta.img,
        scope: "global",
        command: source,
        folder: null,
        sort: 0,
        ownership: { default: 0 },
        flags: {
          "mossback-pf2e-toolkit": {
            source: file,
            description: meta.description,
            foundry: meta.foundry,
            pf2e: meta.pf2e ?? null,
            requires: meta.requires ?? "none",
          },
        },
      },
    });
  }

  if (CHECK_ONLY) {
    for (const { file, doc } of docs) console.log(`ok  ${doc._id}  ${doc.name}  (${file})`);
    console.log(`\n${docs.length} macro(s) valid.`);
    return;
  }

  const { compilePack } = await import("@foundryvtt/foundryvtt-cli");

  await rm(STAGING, { recursive: true, force: true });
  await mkdir(STAGING, { recursive: true });
  for (const { file, doc } of docs) {
    await writeFile(path.join(STAGING, file.replace(/\.js$/, ".json")), JSON.stringify(doc, null, 2));
  }

  await rm(OUT, { recursive: true, force: true });
  await compilePack(STAGING, OUT, { log: true });
  console.log(`\nBuilt ${docs.length} macro(s) into packs/macros.`);
}

main().catch((err) => {
  console.error(`\nBuild failed: ${err.message}`);
  process.exit(1);
});
