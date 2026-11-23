// Registers a released version with the official Foundry package listing,
// using Foundry's Package Release API:
//   https://foundryvtt.com/article/package-release-api/
//
// Environment:
//   FOUNDRY_RELEASE_TOKEN  the package's release token (a GitHub secret). If it
//                          isn't set, the script skips without failing.
//   RELEASE_TAG            the GitHub release tag, e.g. v0.1.0
//   MODULE_JSON            manifest to read the id and compatibility from
//                          (default: module.json)
//
// It sends a dry run first and only submits for real if Foundry accepts it.

import { readFile } from "node:fs/promises";

const API = "https://foundryvtt.com/_api/packages/release_version/";
const REPO = "Mossback-Games/mossback-pf2e-toolkit";

const token = process.env.FOUNDRY_RELEASE_TOKEN;
const tag = process.env.RELEASE_TAG ?? "";

if (!token) {
  console.log("FOUNDRY_RELEASE_TOKEN isn't set; skipping Foundry registration.");
  process.exit(0);
}
if (!/^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(`"${tag}" isn't a release tag like v1.2.3 (pre-releases aren't registered).`);
  process.exit(1);
}

const manifest = JSON.parse(await readFile(process.env.MODULE_JSON ?? "module.json", "utf8"));
const version = tag.slice(1);

const payload = {
  id: manifest.id,
  release: {
    version,
    // Foundry wants this release's own manifest, not the "latest" one
    manifest: `https://github.com/${REPO}/releases/download/${tag}/module.json`,
    notes: `https://github.com/${REPO}/releases/tag/${tag}`,
    compatibility: {
      minimum: manifest.compatibility.minimum,
      verified: manifest.compatibility.verified,
      ...(manifest.compatibility.maximum ? { maximum: manifest.compatibility.maximum } : {}),
    },
  },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function submit(dryRun) {
  const body = JSON.stringify(dryRun ? { ...payload, "dry-run": true } : payload);
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body,
    });
    if (res.status === 429) {
      // Foundry allows one release per package per 60 seconds
      const wait = Number(res.headers.get("retry-after")) || 60;
      console.log(`Rate limited; retrying in ${wait}s.`);
      await sleep((wait + 1) * 1000);
      continue;
    }
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!res.ok || data.status !== "success") {
      throw new Error(`Foundry rejected the ${dryRun ? "dry run" : "release"} (HTTP ${res.status}): ${JSON.stringify(data)}`);
    }
    return data;
  }
  throw new Error("Still rate limited after 3 attempts.");
}

try {
  console.log(`Registering ${manifest.id} ${version} with Foundry (dry run)…`);
  await submit(true);
  console.log("Dry run accepted. Submitting…");
  const result = await submit(false);
  console.log(`Registered ${version}.`, result.page ? `Package page: ${result.page}` : "");
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
