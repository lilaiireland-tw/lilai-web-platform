import assert from "node:assert/strict";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { productionRouteOwner } from "../cloudflare/production-routing-policy";

function filesUnder(root: string): string[] {
  if (!existsSync(root)) return [];
  const result: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    if (statSync(full).isDirectory()) result.push(...filesUnder(full));
    else result.push(full);
  }
  return result;
}

const buildAssetsRoot = ".open-next/assets";
assert(existsSync(buildAssetsRoot), "Production asset audit requires .open-next/assets; run the production OpenNext build first.");
const built = filesUnder(buildAssetsRoot);
assert(built.length > 0, "Production asset audit requires non-empty .open-next/assets; run the production OpenNext build first.");
const publicFiles = filesUnder("public");
const tracked = [
  ...built.map(path => ({ source: "OpenNext", root: buildAssetsRoot, path })),
  ...publicFiles.map(path => ({ source: "public", root: "public", path })),
];
const routedFiles = tracked.filter(({ root, path }) => {
  const rel = relative(root, path).split(sep).join("/");
  return /^(_next|assets|fonts|events)\//i.test(rel);
});
const namespaceCounts = new Map<string, number>();
for (const { source, path } of routedFiles) {
  const rel = relative(source === "OpenNext" ? ".open-next/assets" : "public", path).split(sep).join("/");
  const url = `/${rel}`;
  const owner = productionRouteOwner(url);
  if (owner !== "platform") throw new Error(`${source} asset is not owned by Platform: ${url} (${owner})`);
  const namespace = url.split("/")[1] || "root";
  namespaceCounts.set(namespace, (namespaceCounts.get(namespace) ?? 0) + 1);
}

console.log(`Repository asset inventory: ${tracked.length} files (${built.length} built, ${publicFiles.length} public).`);
console.log(`Files under routed namespaces: ${routedFiles.length}; each checked against the route policy.`);
for (const [namespace, count] of namespaceCounts) console.log(`  /${namespace}/: ${count}`);
console.log("CMS COLLISION STATUS: UNVERIFIED. Repository artifacts cannot enumerate live WordPress media, plugins, backlinks, or CDN paths.");
console.log("Known risk: the broad /_next/, /assets/, and /fonts/ Platform prefixes shadow any current WordPress resource at the same path.");
