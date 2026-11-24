import { readFileSync, writeFileSync } from "node:fs";
import { createUnsubscribeToken } from "../src/lib/consult/unsubscribe-token";
import { CONSULT_UNSUBSCRIBE_PATH } from "../src/lib/consult/ack";

// Input is ONLY exportAssessmentMarketingList() JSON from an isolated/reviewed Sheet, never a questionnaire dump.
async function main() {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw new Error("Usage: tsx scripts/create-unsubscribe-links.ts input.json output.csv");
  const rows: unknown = JSON.parse(readFileSync(input, "utf8"));
  if (!Array.isArray(rows)) throw new Error("Expected minimal marketing list");
  const lines = ["email,unsubscribeUrl"];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row || Object.keys(row).sort().join() !== "email,submissionId" || typeof row.email !== "string" ||
      row.email !== row.email.trim().toLowerCase() || row.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email) || /^[=+@-]/.test(row.email) || seen.has(row.email)) throw new Error("Invalid minimal marketing list");
    seen.add(row.email);
    const token = await createUnsubscribeToken(row.submissionId);
    lines.push(`"${row.email.replaceAll('"', '""')}","https://lilaiireland.com${CONSULT_UNSUBSCRIBE_PATH}?token=${token}"`);
  }
  writeFileSync(output, lines.join("\n") + "\n", { flag: "wx", mode: 0o600 });
}
main().catch(() => { console.error("Link export failed; check private input, output path and server secret. No sending performed."); process.exitCode = 1; });
