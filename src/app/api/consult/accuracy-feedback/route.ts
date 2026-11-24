import { proxyConsultation } from "@/lib/consult/proxy";

export function POST(request: Request) {
  return proxyConsultation(request, true, process.env.CONSULT_GAS_ENDPOINT);
}
