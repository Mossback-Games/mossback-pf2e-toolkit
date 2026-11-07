// Stamps module.json with a release version and matching download URL.
// Used by the release workflow; can also be run locally:
//   npm run release:prep -- v0.1.0

import { readFile, writeFile } from "node:fs/promises";

const tag = process.argv[2];
if (!tag || !/^v\d+\.\d+\.\d+(-[\w.]+)?$/.test(tag)) {
  console.error('Pass a tag like "v0.1.0".');
  process.exit(1);
}

const repo = "Mossback-Games/mossback-pf2e-toolkit";
const manifest = JSON.parse(await readFile("module.json", "utf8"));
manifest.version = tag.slice(1);
manifest.manifest = `https://github.com/${repo}/releases/latest/download/module.json`;
manifest.download = `https://github.com/${repo}/releases/download/${tag}/module.zip`;

await writeFile("module.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(`module.json set to version ${manifest.version}`);
