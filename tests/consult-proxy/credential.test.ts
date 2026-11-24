import assert from "node:assert/strict";
import { test } from "node:test";
import { proxyConsultation } from "../../src/lib/consult/proxy";
import { assessmentFormContract } from "../../src/components/consult/consult-content";

test("credential is server-only; derived instructions are removed; proof is bound to the ACK job", async () => {
  const secret = "isolated-credential-at-least-32-characters";
  const id = "11111111-1111-4111-8111-111111111111";
  const jobId = "22222222-2222-4222-8222-222222222222";
  const payload = {...assessmentFormContract, submissionId:id, name:"QA", nickname:"QA", email:"qa@example.test",
    contactConsent:false, marketingConsent:false, discoveryChannels:[], discoveryOther:"", dcardExposure:null,
    teamEmail:"attacker@example.test", resourceLink:"https://evil.test", stage:"action", leadQuality:"Hot", followUp:"send", nextSteps:"send"};
  const request = (body: unknown, cookie = "") => new Request("https://lilaiireland.com/api/consult/submissions", {
    method:"POST", body:JSON.stringify(body), headers:{Origin:"https://lilaiireland.com", "Content-Type":"application/json", "X-Consult-Request":"1", Cookie:cookie},
  });
  let calls = 0;
  const upstream: typeof fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(String(init?.body));
    assert.equal(body._serverCredential, secret);
    for (const key of ["teamEmail","resourceLink","stage","leadQuality","followUp","nextSteps"]) assert.equal(body[key], undefined);
    return Response.json({status:"ok", accepted:true, jobId});
  };
  const endpoint = "https://script.google.com/macros/s/CONTROLLED_MOCK_ONLY/exec";
  for (const missing of ["", "short"]) assert.equal((await proxyConsultation(request(payload), false, endpoint, upstream, missing)).status, 503);
  assert.equal(calls, 0);
  assert.equal((await proxyConsultation(request({...payload, _serverCredential:secret}), false, endpoint, upstream, secret)).status, 400);
  const response = await proxyConsultation(request(payload), false, endpoint, upstream, secret);
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie")!;
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict/);
  assert.ok(!JSON.stringify(await response.json()).includes(secret));
  const feedback = {type:"accuracy_feedback", submissionId:id, jobId, name:"QA", nickname:"QA", email:"qa@example.test", accuracyAnswer:"很準"};
  const ack: typeof fetch = async (_url, init) => {
    assert.ok(JSON.parse(String(init?.body))._feedbackProof);
    return Response.json({status:"ok"});
  };
  assert.equal((await proxyConsultation(request(feedback), true, endpoint, ack, secret)).status, 403);
  assert.equal((await proxyConsultation(request(feedback, cookie.split(";")[0]), true, endpoint, ack, secret)).status, 200);
  assert.equal((await proxyConsultation(request({...feedback, jobId:id}, cookie.split(";")[0]), true, endpoint, ack, secret)).status, 403);
  const duplicate = await proxyConsultation(request(payload), false, endpoint, async () => Response.json({status:"ok", accepted:true, jobId, deduplicated:true}), secret);
  assert.equal(duplicate.status,200);
  assert.equal(duplicate.headers.get("set-cookie"),null);
});
