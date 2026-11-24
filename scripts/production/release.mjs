import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync } from "node:fs";
import { baseline, platformConfig, backendConfig, scriptPath, api, github,
  run, save, read, capture, assertSource, assertInfrastructure } from "./lib.mjs";
import { publicSmoke, bindingSmoke } from "./smoke.mjs";

const directory = ".cloudflare/release";
const first = process.env.RELEASE_MODE === "first-cutover";
const message = `git:${process.env.GITHUB_SHA};run:${process.env.GITHUB_RUN_ID};attempt:${process.env.GITHUB_RUN_ATTEMPT}`;
function command(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command} failed`);
}
async function sourceAndProtection({ currentMain = true } = {}) {
  assertSource();
  const main = await github("git/ref/heads/main");
  if (currentMain) assert.equal(main.object.sha, process.env.GITHUB_SHA, "main advanced: dispatch a new release");
  const environment = await github("environments/production");
  const reviewers = environment.protection_rules?.find(r => r.type === "required_reviewers");
  assert(reviewers?.reviewers?.length > 0, "Configure production Required Reviewers first");
  const policy = environment.deployment_branch_policy;
  assert(policy?.custom_branch_policies === true, "production must allow only main");
  const rules = await github("environments/production/deployment-branch-policies");
  assert.deepEqual(rules.branch_policies.map(r => ({ name: r.name, type: r.type })), [{ name: "main", type: "branch" }]);
}
async function downloadRecord(runId, artifactName) {
  assert.match(String(runId), /^\d+$/);
  const runInfo = await github(`actions/runs/${runId}`);
  assert.equal(runInfo.head_branch, "main");
  assert([".github/workflows/production-deploy.yml", ".github/workflows/production-rollback.yml"].includes(runInfo.path));
  assert.equal(runInfo.event, "workflow_dispatch");
  const artifacts = await github(`actions/runs/${runId}/artifacts?per_page=100`);
  assert(artifacts.artifacts.some(a => a.name === artifactName && !a.expired), "Release record missing/expired");
  const destination = `${directory}/source-${runId}-${artifactName}`;
  command("gh", ["run", "download", String(runId), "--repo", process.env.GITHUB_REPOSITORY,
    "--name", artifactName, "--dir", destination]);
  return { runInfo, directory: destination };
}
async function lastVerified() {
  // Artifacts, not the last attempted deployment, define the recovery pair.
  for (let page = 1; page <= 10; page++) {
    const result = await github(`actions/artifacts?name=production-verified&per_page=100&page=${page}`);
    for (const artifact of result.artifacts) {
      if (artifact.expired || artifact.workflow_run?.head_branch !== "main") continue;
      const { runInfo, directory } = await downloadRecord(artifact.workflow_run.id, "production-verified");
      if (runInfo.conclusion !== "success") continue;
      const record = read(`${directory}/verified.json`);
      assert.equal(record.status, "verified");
      return record;
    }
    if (result.artifacts.length < 100) break;
  }
  throw new Error("No retained verified release: first-cutover or separately reviewed baseline recovery required");
}
function samePair(actual, expected) {
  for (const name of [baseline.platform, baseline.backend, baseline.router]) {
    assert.equal(actual.workers[name].version, expected.workers[name].version, `${name}: external deployment drift`);
  }
}
async function preflight() {
  assert(["first-cutover", "release"].includes(process.env.RELEASE_MODE));
  assert.equal(process.env.COMPATIBILITY_APPROVED, "true", "Review adjacent frontend/backend and Queue payload compatibility");
  await sourceAndProtection();
  const token = await api(`accounts/${baseline.account_id}/tokens/verify`);
  assert.equal(token.status, "active", "Cloudflare token is inactive");
  const snapshot = await capture();
  assertInfrastructure(snapshot, first);
  if (first) {
    for (const name of Object.keys(baseline.versions)) assert.equal(snapshot.workers[name].version, baseline.versions[name], "Initial production baseline changed: re-audit required");
    snapshot.legacyCommit = baseline.legacy_commit;
  } else {
    const previous = await lastVerified();
    samePair(snapshot, previous);
    snapshot.commit = previous.commit;
  }
  snapshot.legacy = first;
  snapshot.smoke = await publicSmoke({ legacy: first });
  snapshot.status = "verified-before";
  save(`${directory}/before.json`, snapshot);
  console.log("PASS production preflight; snapshot saved; schema unchanged");
}
async function deploy(name, config, env = []) {
  await sourceAndProtection({ currentMain: false });
  const before = read(`${directory}/before.json`);
  const current = await capture();
  // Backend is still legacy during first-cutover, including after Platform activation.
  assertInfrastructure(current, first);
  const expected = structuredClone(before);
  if (name === baseline.backend) {
    assert(existsSync(`${directory}/platform.json`), "Platform deployment/probe must finish first");
    expected.workers[baseline.platform].version = read(`${directory}/platform.json`).version;
  }
  samePair(current, expected);
  run(["versions", "upload", "--config", config, ...env, "--keep-vars", "--message", message]);
  const versions = await api(`${scriptPath(name)}/versions`);
  const matching = versions.items.filter(v => v.annotations?.["workers/message"] === message);
  assert.equal(matching.length, 1, "Cannot identify unique uploaded version");
  const version = matching[0].id;
  // Activation only. Never invoke deploy (which reconciles Routes/Consumers/Cron).
  await api(`${scriptPath(name)}/deployments`, {
    strategy: "percentage", versions: [{ version_id: version, percentage: 100 }],
    annotations: { "workers/message": message },
  });
  save(`${directory}/${name === baseline.platform ? "platform" : "backend"}.json`, { version, commit: process.env.GITHUB_SHA });
  if (name === baseline.platform) await bindingSmoke({ platformOnly: true });
}
async function verify() {
  const before = read(`${directory}/before.json`);
  const snapshot = await capture();
  assertInfrastructure(snapshot);
  assert.equal(snapshot.workers[baseline.router].version, before.workers[baseline.router].version, "Router changed during release");
  for (const [name, file] of [[baseline.platform, "platform"], [baseline.backend, "backend"]]) {
    const recorded = read(`${directory}/${file}.json`);
    assert.equal(recorded.commit, process.env.GITHUB_SHA);
    assert.equal(snapshot.workers[name].version, recorded.version);
    const version = await api(`${scriptPath(name)}/versions/${recorded.version}`);
    assert.equal(version.annotations?.["workers/message"], message, "Worker version does not match commit/run");
  }
  await bindingSmoke();
  snapshot.smoke = await publicSmoke({ previous: before.smoke });
  const final = await capture();
  assertInfrastructure(final);
  samePair(final, snapshot);
  snapshot.legacy = false;
  snapshot.commit = process.env.GITHUB_SHA;
  snapshot.status = "verified";
  save(`${directory}/verified.json`, snapshot);
  console.log("PASS both Workers verified against the same main commit");
}
async function rollback() {
  await sourceAndProtection();
  assert.equal(process.env.COMPATIBILITY_APPROVED, "true", "Confirm schema, Queue and adjacent-version compatibility");
  const targetType = process.env.ROLLBACK_TARGET;
  assert(["before", "verified"].includes(targetType));
  const artifact = targetType === "before" ? "production-evidence" : "production-verified";
  const source = await downloadRecord(process.env.SOURCE_RUN_ID, artifact);
  if (targetType === "verified") assert.equal(source.runInfo.conclusion, "success");
  const target = read(`${source.directory}/${targetType}.json`);
  assert.equal(target.status, targetType === "before" ? "verified-before" : "verified");
  assertInfrastructure(target, target.legacy);
  const current = await capture();
  // Accept partial forward deploys, but never infrastructure/schema drift.
  const currentLegacy = !current.workers[baseline.backend].bindings.some(b => b.name === "PLATFORM");
  assertInfrastructure(current, currentLegacy);
  assert.equal(current.workers[baseline.router].version, target.workers[baseline.router].version, "Router drift: separate review required");
  save(`${directory}/rollback-before.json`, current);
  for (const name of [baseline.platform, baseline.backend]) {
    const version = await api(`${scriptPath(name)}/versions/${target.workers[name].version}`);
    assert.equal(version.id, target.workers[name].version, "Rollback version unavailable");
  }
  // Legacy carries its own assets; restore it before replacing Platform assets.
  const order = target.legacy ? [baseline.backend, baseline.platform] : [baseline.platform, baseline.backend];
  for (const name of order) await api(`${scriptPath(name)}/deployments`, {
    strategy: "percentage", versions: [{ version_id: target.workers[name].version, percentage: 100 }],
    annotations: { "workers/message": `rollback:${process.env.SOURCE_RUN_ID};${message}` },
  });
  const restored = await capture();
  assertInfrastructure(restored, target.legacy);
  samePair(restored, target);
  if (!target.legacy) await bindingSmoke();
  restored.smoke = await publicSmoke({ legacy: target.legacy, previous: target.smoke });
  const final = await capture();
  assertInfrastructure(final, target.legacy);
  samePair(final, restored);
  restored.commit = target.commit;
  restored.legacy = target.legacy;
  restored.status = "verified";
  restored.restoredFrom = process.env.SOURCE_RUN_ID;
  save(`${directory}/verified.json`, restored);
}
function summary() {
  const success = process.env.RELEASE_RESULT === "success" && existsSync(`${directory}/verified.json`);
  const lines = [`## Production ${success ? "verified" : "NOT verified"}`, `Commit: ${process.env.GITHUB_SHA}`,
    `Run: ${process.env.GITHUB_RUN_ID}`, "No D1 schema, Route, DNS, Queue consumer or Cron mutations."];
  for (const file of ["before", "verified"]) if (existsSync(`${directory}/${file}.json`)) {
    const record = read(`${directory}/${file}.json`);
    lines.push(`\n${file} (${record.commit}):`);
    for (const name of [baseline.platform, baseline.backend]) lines.push(`- ${name}: ${record.workers[name].version}`);
  }
  if (!success) lines.push("Inspect production-evidence; restore its verified-before pair with Production Rollback if needed. No automatic rollback occurred.");
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
  console.log(lines.join("\n"));
}
const action = process.argv[2];
if (action === "summary") summary();
else if (action === "preflight") await preflight();
else if (action === "platform") await deploy(baseline.platform, platformConfig);
else if (action === "backend") await deploy(baseline.backend, backendConfig, ["--env", "production"]);
else if (action === "verify") await verify();
else if (action === "rollback") await rollback();
else throw new Error("Expected preflight, platform, backend, verify, rollback, summary");
