import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

import { analyzeAndSaveTicket } from
  "@/server/modules/ai/services/ticketAnalysisPresistance";

export const runtime = "nodejs";

const authClient = new OAuth2Client();

export async function POST(request: Request) {
  // Xác thực request do Cloud Tasks gửi.
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  const audience = process.env.AI_WORKER_AUDIENCE;
  const expectedEmail =
    process.env.CLOUD_TASKS_SERVICE_ACCOUNT;

  if (!token || !audience || !expectedEmail) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const verified = await authClient.verifyIdToken({
      idToken: token,
      audience,
    });

    const claims = verified.getPayload();

    if (
      !claims ||
      claims.email !== expectedEmail ||
      claims.email_verified !== true
    ) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("ticketId" in body) ||
    !("shipperId" in body) ||
    !("content" in body) ||
    typeof body.ticketId !== "string" ||
    typeof body.shipperId !== "string" ||
    typeof body.content !== "string" ||
    !body.ticketId.trim() ||
    !body.shipperId.trim() ||
    !body.content.trim()
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid task payload" },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeAndSaveTicket({
      ticketId: body.ticketId,
      shipperId: body.shipperId,
      content: body.content,
    });

    console.log("[AI_WORKER_SUCCESS]", {
      ticketId: body.ticketId,
      cached: result.cached,
    });

    return NextResponse.json({
      success: true,
      ticketId: body.ticketId,
    });
  } catch (error) {
    console.error("[AI_WORKER_ERROR]", error);

    // HTTP 500 để Cloud Tasks có thể retry.
    return NextResponse.json(
      {
        success: false,
        message: "AI analysis failed",
      },
      { status: 500 },
    );
  }
}