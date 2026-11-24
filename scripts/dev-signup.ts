import { spawn } from "node:child_process";

// Keep the local preview separate from any existing Next dev/build cache.
const server = spawn(process.execPath, [
  "node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "127.0.0.1", "--port", "3120",
], {
  stdio: "inherit",
  env: { ...process.env, SITE_DEPLOYMENT_ENV: "staging", EVENT_DEPLOYMENT_ENV: "preview", SIGNUP_LOCAL_PREVIEW: "1" },
});
server.on("error", error => { console.error(error); process.exitCode = 1; });
server.on("exit", code => { process.exitCode = code ?? 1; });
