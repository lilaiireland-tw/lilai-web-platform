import { forwardLocalSignupRequest } from "@/lib/language-school-signup/local-backend";

export function GET(request: Request) {
  return forwardLocalSignupRequest(request, "turnstile-config");
}
