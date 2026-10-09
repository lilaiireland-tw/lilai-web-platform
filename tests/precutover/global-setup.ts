import type { FullConfig } from "@playwright/test";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import next from "next";

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL as string;
  const target = new URL(baseURL);
  if (!(["127.0.0.1", "localhost"].includes(target.hostname)) || target.port !== "3100") {
    throw new Error(`Local QA must use the fixed loopback Next.js server; got ${baseURL}`);
  }

  process.env.SITE_DEPLOYMENT_ENV = "staging";
  process.env.WORDPRESS_ORIGIN = "http://127.0.0.1:3199";
  process.env.WORDPRESS_API_BASE = "http://127.0.0.1:3199/wp-json/wp/v2";
  process.env.WOOCOMMERCE_STORE_API_BASE = "http://127.0.0.1:3199/wp-json/wc/store/v1";
  const app = next({ dev: true, webpack: true, dir: process.cwd(), hostname: "127.0.0.1", port: 3100 });
  await app.prepare();
  const server = createServer(app.getRequestHandler());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(3100, "127.0.0.1", resolve);
  });

  const artifactDir = path.resolve("artifacts/precutover-playwright");
  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(path.join(artifactDir, "run-metadata.json"), JSON.stringify({
    startedAt: new Date().toISOString(),
    testedCommit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    baseURL,
    runtime: "local-nextjs",
    node: process.version,
    platform: `${process.platform}-${process.arch}`,
  }, null, 2));

  return async () => {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await app.close();
  };
}
