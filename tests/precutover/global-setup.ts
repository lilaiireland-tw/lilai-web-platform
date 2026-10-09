import { request, type FullConfig } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const EXPECTED_UPSTREAM = "remote-service-binding:lilai-web-platform-router";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL as string;
  const api = await request.newContext({ baseURL });
  const response = await api.get("/", { maxRedirects: 0 });
  const upstream = response.headers()["x-lilai-runtime-probe-upstream"];
  if (response.status() !== 200 || upstream !== EXPECTED_UPSTREAM) {
    throw new Error(`Runtime probe check failed: HTTP ${response.status()}, upstream=${upstream || "missing"}`);
  }
  await api.dispose();

  const artifactDir = path.resolve("artifacts/precutover-playwright");
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(path.join(artifactDir, "run-metadata.json"), JSON.stringify({
    startedAt: new Date().toISOString(),
    testedCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    baseURL,
    upstream,
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
  }, null, 2));
}
