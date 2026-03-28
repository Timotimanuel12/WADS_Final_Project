import { type NextRequest } from "next/server";
import { requireAuth, isAuthError } from "@/lib/auth-middleware";
import { err, ok } from "@/lib/api-response";
import { getAnalyticsForUser } from "@/lib/services/analytics-service";

// GET /api/analytics — aggregated stats for the authenticated user
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const analytics = await getAnalyticsForUser(auth.userId);
    return ok(analytics);
  } catch {
    return err("Failed to fetch analytics", 500);
  }
}
