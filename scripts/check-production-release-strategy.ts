import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

for (const file of ["production-deploy.yml", "production-rollback.yml"]) {
  const workflow = readFileSync(`.github/workflows/${file}`, "utf8");
  assert.match(workflow, /^  workflow_dispatch:/m);
  assert.doesNotMatch(workflow, /^  (push|pull_request|workflow_call|schedule):/m);
  assert.match(workflow, /if: github.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /environment: production/);
  assert.match(workflow, /group: cloudflare-production-release/);
  assert.match(workflow, /cancel-in-progress: false/);
  assert.match(workflow, /ref: \$\{\{ github.sha \}\}/);
  assert.match(workflow, /actions: read/);
  assert.doesNotMatch(workflow, /staging|wrangler deploy|cf:deploy:production-platform|production-router.jsonc/);
}
const validation = readFileSync(".github/workflows/production-private-deploy.yml", "utf8");
assert.match(validation, /pull_request:/);
assert.match(validation, /push:/);
assert.doesNotMatch(validation, /CLOUDFLARE_API_TOKEN|deploy-platform|environment: production/);
const staging = readFileSync(".github/workflows/staging.yml", "utf8");
assert.match(staging, /environment: staging/);
assert.match(staging, /CLOUDFLARE_STAGING_ENABLED == 'true'/);
console.log("PASS manual main-only paired releases and rollback share a production gate/lock; automatic CI remains validation-only");
