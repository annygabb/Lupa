import { getHealthPayload } from "@/lib/health";
export const dynamic = "force-dynamic";
export async function GET() {
  return Response.json(getHealthPayload(), {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
