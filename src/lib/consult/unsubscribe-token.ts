import { isSubmissionId } from "./ack";

const purpose = new TextEncoder().encode("consult.marketing-unsubscribe.v1");

async function tokenKey(secret: string | undefined) {
  if (!secret || !/^[0-9a-f]{64}$/i.test(secret)) throw new Error("Unsubscribe secret not configured");
  const bytes = Uint8Array.from(secret.match(/../g)!, value => parseInt(value, 16));
  return crypto.subtle.importKey("raw", bytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/** Server/operator only: authenticated encryption hides the correlation ID and binds the sole permitted action. */
export async function createUnsubscribeToken(submissionId: string, secret = process.env.CONSULT_UNSUBSCRIBE_SECRET) {
  if (!isSubmissionId(submissionId)) throw new Error("Invalid submission ID");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: purpose }, await tokenKey(secret), new TextEncoder().encode(submissionId));
  return Buffer.concat([iv, Buffer.from(encrypted)]).toString("base64url");
}

export async function readUnsubscribeToken(token: string, secret = process.env.CONSULT_UNSUBSCRIBE_SECRET) {
  if (!/^[A-Za-z0-9_-]{86}$/.test(token)) throw new Error("Invalid unsubscribe token");
  const bytes = Buffer.from(token, "base64url");
  if (bytes.toString("base64url") !== token) throw new Error("Invalid unsubscribe token");
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes.subarray(0, 12), additionalData: purpose }, await tokenKey(secret), bytes.subarray(12));
  const id = new TextDecoder().decode(plain);
  if (!isSubmissionId(id)) throw new Error("Invalid unsubscribe token");
  return id;
}
