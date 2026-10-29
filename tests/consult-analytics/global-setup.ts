import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import next from "next";

// Requires a production Next build with cloudflare/production-platform.jsonc vars.
// Bind only loopback; browser tests intercept every request, including Google/GAS.
export default async function setup() {
  Object.assign(process.env, JSON.parse(readFileSync("cloudflare/production-platform.jsonc", "utf8")).vars);
  const app = next({ dev: false, dir: process.cwd(), hostname: "127.0.0.1", port: 3101 });
  await app.prepare();
  const server = createServer(app.getRequestHandler());
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(3101, "127.0.0.1", resolve);
  });
  return async () => {
    await new Promise<void>(resolve => server.close(() => resolve()));
    await app.close();
  };
}
