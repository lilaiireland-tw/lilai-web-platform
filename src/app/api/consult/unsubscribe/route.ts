import { unsubscribe } from "@/lib/consult/unsubscribe";

export function GET(request: Request) { return unsubscribe(request); }
export function POST(request: Request) { return unsubscribe(request); }
