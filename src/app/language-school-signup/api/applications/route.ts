import { forwardLocalSignupRequest } from "@/lib/language-school-signup/local-backend";

export function POST(request: Request) {
  return forwardLocalSignupRequest(request, "applications");
}
