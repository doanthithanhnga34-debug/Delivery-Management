
import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";

import { analyzeAndSaveTicket } from
  "@/server/modules/ai/services/ticketAnalysisPresistance";
export const maxDuration = 60;

// =====================================================
// GOOGLE AUTH
// =====================================================

const authClient = new OAuth2Client();

// =====================================================
// TYPES
// =====================================================

type TaskPayload = {
  ticketId: string;
  shipperId: string;
  content: string;
};

// =====================================================
// PAYLOAD VALIDATION
// =====================================================

function isTaskPayload(
  value: unknown,
): value is TaskPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.ticketId === "string" &&
    data.ticketId.trim().length > 0 &&
    data.ticketId.length <= 128 &&

    typeof data.shipperId === "string" &&
    data.shipperId.trim().length > 0 &&
    data.shipperId.length <= 128 &&

    typeof data.content === "string" &&
    data.content.trim().length > 0 &&
    data.content.length <= 20000
  );
}

// =====================================================
// CLOUD TASKS OIDC AUTHENTICATION
// =====================================================

async function verifyCloudTasksAuth(
  request: Request,
): Promise<boolean> {
  const expectedAudience =
    process.env.AI_WORKER_AUDIENCE;

  const expectedEmail =
    process.env.CLOUD_TASKS_WORKER_SERVICE_ACCOUNT;

  if (!expectedAudience || !expectedEmail) {
    throw new Error("AI Worker auth config missing");
  }

  const authorization =
    request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return false;
  }

  try {
    const verified = await authClient.verifyIdToken({
      idToken: token,
      audience: expectedAudience,
    });

    const claims = verified.getPayload();

    if (!claims) {
      return false;
    }

    // Chỉ chấp nhận Google service account đã cấu hình.
    const validEmail =
      claims.email === expectedEmail;

    const verifiedEmail =
      claims.email_verified === true;

    const validIssuer =
      claims.iss === "https://accounts.google.com" ||
      claims.iss === "accounts.google.com";

    return validEmail && verifiedEmail && validIssuer;
  } catch (error) {
    console.warn("[AI_WORKER_AUTH_REJECTED]", {
      message:
        error instanceof Error
          ? error.message
          : "Invalid token",
    });

    return false;
  }
}

// =====================================================
// POST /api/internal/analyze-ticket
// =====================================================

export async function POST(request: Request) {
  const startedAt = Date.now();

  // 1. Kiểm tra cấu hình xác thực
  if (
    !process.env.AI_WORKER_AUDIENCE ||
    !process.env.CLOUD_TASKS_WORKER_SERVICE_ACCOUNT
  ) {
    console.error("[AI_WORKER_CONFIG_MISSING]");

    return NextResponse.json(
      {
        success: false,
        message: "AI Worker configuration missing",
      },
      { status: 500 },
    );
  }

  // 2. Xác thực Google OIDC
  const authenticated =
    await verifyCloudTasksAuth(request);

  if (!authenticated) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  // 3. Parse request body
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    console.error("[AI_WORKER_INVALID_JSON]");

    // Payload cố định lỗi: tránh retry không cần thiết
    return NextResponse.json({
      success: false,
      retryable: false,
      message: "Invalid JSON",
    });
  }

  // 4. Validate payload
  if (!isTaskPayload(body)) {
    console.error("[AI_WORKER_INVALID_PAYLOAD]");

    return NextResponse.json({
      success: false,
      retryable: false,
      message: "Invalid task payload",
    });
  }

  const {
    ticketId,
    shipperId,
    content,
  } = body;

  const taskName =
    request.headers.get("x-cloudtasks-taskname");

  const retryCount =
    request.headers.get("x-cloudtasks-taskretrycount");

  console.log("[AI_WORKER_STARTED]", {
    ticketId,
    shipperId,
    taskName,
    retryCount,
  });

  // 5. Phân tích Gemini + lưu Turso
  try {
    await analyzeAndSaveTicket({
      ticketId,
      shipperId,
      content,
    });

    const durationMs = Date.now() - startedAt;

    console.log("[AI_WORKER_COMPLETED]", {
      ticketId,
      durationMs,
    });

    // Cloud Tasks nhận 2xx => task hoàn tất
    return NextResponse.json({
      success: true,
      ticketId,
      status: "completed",
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;

    console.error("[AI_WORKER_FAILED]", {
      ticketId,
      taskName,
      retryCount,
      durationMs,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });

    // Cloud Tasks có thể retry theo cấu hình queue.
    return NextResponse.json(
      {
        success: false,
        ticketId,
        status: "failed",
        message: "AI analysis failed",
      },
      { status: 500 },
    );
  }
}
