const operation = process.argv[2] || "remote verification";
const required = "I_UNDERSTAND_CLOUDFLARE_USAGE";

if (process.env.ALLOW_REMOTE_QA !== required) {
  console.error(`Blocked ${operation}: this command can contact deployed Cloudflare Workers.`);
  console.error(`To authorize intentionally, set ALLOW_REMOTE_QA=${required} for this command.`);
  console.error("Service Binding requests can trigger additional downstream Worker invocations.");
  process.exit(1);
}

console.warn(`WARNING: authorized remote ${operation}; Cloudflare Production request quota may be consumed.`);
