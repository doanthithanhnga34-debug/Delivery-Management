
import { randomUUID, timingSafeEqual } from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { NextResponse } from "next/server";


// =====================================================
// ENVIRONMENT
// =====================================================

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

// =====================================================
// INTERNAL TEST AUTH
// =====================================================

function isValidSecret(request: Request): boolean {
  const expected = process.env.INTERNAL_TEST_SECRET;
  const received = request.headers.get("x-test-secret");

  if (!expected || !received) {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

// =====================================================
// GOOGLE WIF AUTHENTICATION
// =====================================================

async function getGoogleAccessToken(): Promise<string> {
  const projectNumber = requiredEnv("GCP_PROJECT_NUMBER");

  const poolId = requiredEnv(
    "GCP_WORKLOAD_IDENTITY_POOL_ID",
  );

  const providerId = requiredEnv(
    "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID",
  );

  const serviceAccount = requiredEnv(
    "CLOUD_TASKS_SERVICE_ACCOUNT",
  );

  // Lấy token do Vercel phát hành
  const vercelOidcToken = await getVercelOidcToken();

  const audience =
    `//iam.googleapis.com/projects/${projectNumber}` +
    `/locations/global/workloadIdentityPools/${poolId}` +
    `/providers/${providerId}`;

  // Vercel OIDC -> Google STS -> Service Account
  const client = ExternalAccountClient.fromJSON({
    type: "external_account",

    audience,

    subject_token_type:
      "urn:ietf:params:oauth:token-type:jwt",

    token_url:
      "https://sts.googleapis.com/v1/token",

    service_account_impersonation_url:
      "https://iamcredentials.googleapis.com/v1/" +
      "projects/-/serviceAccounts/" +
      `${serviceAccount}:generateAccessToken`,

    subject_token_supplier: {
      getSubjectToken: async () => vercelOidcToken,
    },
  });

  if (!client) {
    throw new Error("Cannot initialize Google Auth Client");
  }

  client.scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
  ];

  const result = await client.getAccessToken();

  if (!result.token) {
    throw new Error("Google Access Token is empty");
  }

  return result.token;
}

// =====================================================
// CLOUD TASKS
// =====================================================

type CloudTaskResponse = {
  name?: string;

  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
};

async function createTestCloudTask(accessToken: string) {
  const projectId = requiredEnv("GCP_PROJECT_ID");
  const location = requiredEnv("CLOUD_TASKS_LOCATION");
  const queue = requiredEnv("CLOUD_TASKS_QUEUE");

  const workerUrl = requiredEnv("AI_WORKER_URL");

  const workerAudience = requiredEnv(
    "AI_WORKER_AUDIENCE",
  );

  const workerServiceAccount = requiredEnv(
    "CLOUD_TASKS_WORKER_SERVICE_ACCOUNT",
  );

  const bypassSecret = requiredEnv(
    "VERCEL_PROTECTION_BYPASS_SECRET",
  );

  // Validate target URL
  const parsedUrl = new URL(workerUrl);

  if (
    parsedUrl.protocol !== "https:" ||
    !parsedUrl.hostname.endsWith(".vercel.app") ||
    parsedUrl.pathname !== "/api/internal/analyze-ticket"
  ) {
    throw new Error("Invalid AI_WORKER_URL");
  }

  const parent =
    `projects/${projectId}` +
    `/locations/${location}` +
    `/queues/${queue}`;

  const taskId = `ai-test-${randomUUID()}`;
  const ticketId = `AI-TEST-${randomUUID()}`;

  // Payload thử nghiệm, không lưu Google Sheets
  const payload = {
    ticketId,

    shipperId: "TEST-SHIPPER",

    content:
      "Giao 25 Vạn Kiếp, phường Bình Thạnh, TP.HCM. " +
      "Thu khách 495, ship 20, phí chành 30.",
  };

  const encodedBody = Buffer.from(
    JSON.stringify(payload),
    "utf8",
  ).toString("base64");

  const task = {
    name: `${parent}/tasks/${taskId}`,

    httpRequest: {
      httpMethod: "POST",

      // URL thật của Vercel AI Worker
      url: workerUrl,

      headers: {
        "Content-Type": "application/json",

        // Chỉ sử dụng khi test trên protected Preview
        "x-vercel-protection-bypass": bypassSecret,
      },

      // Google Cloud Tasks phát hành ID token
      oidcToken: {
        serviceAccountEmail: workerServiceAccount,
        audience: workerAudience,
      },

      body: encodedBody,
    },
  };

  const response = await fetch(
    `https://cloudtasks.googleapis.com/v2/${parent}/tasks`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({ task }),

      cache: "no-store",
    },
  );

  const result =
    (await response.json()) as CloudTaskResponse;

  if (!response.ok) {
    console.error("[CLOUD_TASK_CREATE_ERROR]", {
      statusCode: response.status,
      errorCode: result.error?.status,
      errorMessage: result.error?.message,
    });

    throw new Error(
      `Cloud Tasks create failed: ${response.status} ` +
      `${result.error?.status ?? "UNKNOWN"}`,
    );
  }

  if (!result.name) {
    throw new Error("Cloud Tasks response missing task name");
  }

  return {
    taskName: result.name,
    ticketId,
    targetUrl: workerUrl,
  };
}

// =====================================================
// GET /api/internal/cloud
// =====================================================

export async function GET(request: Request) {
  // Chỉ dùng GET này để test thủ công trên Preview.
  if (!isValidSecret(request)) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    // 1. Xác thực Google
    const accessToken = await getGoogleAccessToken();

    console.log("[GOOGLE_WIF_SUCCESS]");

    // 2. Tạo Cloud Task
    const task = await createTestCloudTask(accessToken);

    console.log("[CLOUD_TASK_CREATED]", {
      taskName: task.taskName,
      ticketId: task.ticketId,
    });

    // 3. Trả kết quả enqueue
    return NextResponse.json({
      success: true,

      message: "Đã tạo AI Cloud Task thử nghiệm",

      data: task,
    });
  } catch (error) {
    console.error("[CLOUD_TASK_TEST_FAILED]", {
      message:
        error instanceof Error
          ? error.message
          : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tạo AI Cloud Task",
      },
      { status: 500 },
    );
  }
}
