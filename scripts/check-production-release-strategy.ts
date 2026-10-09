import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const productionWorkflow = readFileSync(".github/workflows/production-private-deploy.yml", "utf8");
const stagingWorkflow = readFileSync(".github/workflows/staging.yml", "utf8");

assert.match(productionWorkflow, /pull_request:\s*\n\s+branches:\s*\[develop,\s*main\]/);
assert.match(productionWorkflow, /push:\s*\n\s+branches:\s*\[develop,\s*main\]/);
assert.match(productionWorkflow, /^  workflow_dispatch:\s*$/m);
const deployJobStart = productionWorkflow.search(/^  deploy-private:\s*$/m);
assert.notEqual(deployJobStart, -1, "Missing production deploy job");
const deployJob = productionWorkflow.slice(deployJobStart);
assert.match(deployJob, /needs:\s*validate/);
assert.match(deployJob, /if:\s*github\.event_name == 'workflow_dispatch'\s*&&\s*github\.ref == 'refs\/heads\/main'\s*&&\s*inputs\.deploy_private_workers == true/);
assert.match(deployJob, /environment:\s*production/);
assert.match(productionWorkflow, /deploy_private_workers:[\s\S]*?type:\s*boolean[\s\S]*?default:\s*false/);
assert.equal((productionWorkflow.match(/npm run cf:deploy:production-private/g) ?? []).length, 1);
assert.match(deployJob, /npm run cf:deploy:production-private/);

assert.match(stagingWorkflow, /pull_request:\s*\n\s+branches:\s*\[develop\]/);
assert.match(stagingWorkflow, /push:\s*\n\s+branches:\s*\[develop\]/);
const stagingDeployJob = stagingWorkflow.slice(stagingWorkflow.search(/^  deploy:\s*$/m));
assert.match(stagingDeployJob, /if:\s*github\.ref == 'refs\/heads\/develop'\s*&&\s*vars\.CLOUDFLARE_STAGING_ENABLED == 'true'/);
assert.match(stagingDeployJob, /environment:\s*staging/);

console.log("PASS production validation runs on PRs and pushes to develop and main");
console.log("PASS production deployment command exists only behind manual main dispatch, explicit true input, and production environment");
console.log("PASS staging validation and safeguarded develop deployment remain enabled");
