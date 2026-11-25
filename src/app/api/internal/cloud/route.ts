
import { randomUUID } from "node:crypto";
import { timingSafeEqual } from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { NextResponse } from "next/server";


function isValidSecret(request: Request): boolean {
  const expected = process.env.INTERNAL_TEST_SECRET;
  const received = request.headers.get("x-test-secret");

  if (!expected || !received) return false;

  const a = Buffer.from(expected);
  const b = Buffer.from(received);

  return a.length === b.length && timingSafeEqual(a, b);
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

// Cloud Tasks gọi lại endpoint này.
// Đây chỉ là endpoint test, chưa gọi Gemini.
export async function POST(request: Request) {
  if (!isValidSecret(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
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
    !("type" in body) ||
    body.type !== "cloud_tasks_test"
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid test payload" },
      { status: 400 },
    );
  }

  console.log("[CLOUD_TASK_RECEIVED]", {
    taskName: request.headers.get("x-cloudtasks-taskname"),
  });

  return NextResponse.json({
    success: true,
    message: "Vercel đã nhận Cloud Task thành công",
  });
}

// Gọi GET để đăng ký một Cloud Task thử nghiệm.
export async function GET(request: Request) {
  if (!isValidSecret(request)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const projectId = requiredEnv("GCP_PROJECT_ID");
    const projectNumber = requiredEnv("GCP_PROJECT_NUMBER");
    const serviceAccount = requiredEnv(
      "CLOUD_TASKS_SERVICE_ACCOUNT",
    );
    const poolId = requiredEnv(
      "GCP_WORKLOAD_IDENTITY_POOL_ID",
    );
    const providerId = requiredEnv(
      "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID",
    );
    const location = requiredEnv("CLOUD_TASKS_LOCATION");
    const queue = requiredEnv("CLOUD_TASKS_QUEUE");
    const bypassSecret = requiredEnv(
      "VERCEL_PROTECTION_BYPASS_SECRET",
    );
    const testSecret = requiredEnv("INTERNAL_TEST_SECRET");
    const vercelUrl = requiredEnv("VERCEL_URL");

    // 1. Lấy Vercel OIDC Token
    const oidcToken = await getVercelOidcToken();

    // 2. Xác thực Google Workload Identity Federation
    const audience =
      `//iam.googleapis.com/projects/${projectNumber}` +
      `/locations/global/workloadIdentityPools/${poolId}` +
      `/providers/${providerId}`;

    const authClient = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience,
      subject_token_type:
        "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url:
        "https://iamcredentials.googleapis.com/v1/projects/-/" +
        `serviceAccounts/${serviceAccount}:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: async () => oidcToken,
      },
    });

    if (!authClient) {
      throw new Error("Cannot initialize Google Auth Client");
    }

    authClient.scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ];

    const accessToken = await authClient.getAccessToken();

    if (!accessToken.token) {
      throw new Error("Google Access Token is empty");
    }

    // 3. Chuẩn bị Cloud Task
    const parent =
      `projects/${projectId}/locations/${location}/queues/${queue}`;

    const taskId = `test-${randomUUID()}`;

    const targetUrl =
      `https://${vercelUrl}/api/internal/cloud`;

    const payload = {
      type: "cloud_tasks_test",
      taskId,
    };

    // REST Cloud Tasks yêu cầu body được mã hóa base64.
    const encodedBody = Buffer.from(
      JSON.stringify(payload),
    ).toString("base64");

    // 4. Tạo HTTP Task bằng Cloud Tasks REST API
    const response = await fetch(
      `https://cloudtasks.googleapis.com/v2/${parent}/tasks`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: {
            name: `${parent}/tasks/${taskId}`,
            httpRequest: {
              httpMethod: "POST",
              url: targetUrl,
              headers: {
                "Content-Type": "application/json",
                "x-test-secret": testSecret,
                "x-vercel-protection-bypass": bypassSecret,
              },
              body: encodedBody,
            },
          },
        }),
        cache: "no-store",
      },
    );

    const result: {
      name?: string;
      error?: {
        code?: number;
        status?: string;
        message?: string;
      };
    } = await response.json();

    if (!response.ok) {
      console.error("[CLOUD_TASK_CREATE_ERROR]", {
        status: response.status,
        code: result.error?.status,
      });

      return NextResponse.json(
        {
          success: false,
          step: "create_task",
          status: response.status,
          error: {
            code: result.error?.status,
            message: "Cloud Tasks rejected createTask",
          },
        },
        { status: 502 },
      );
    }

    console.log("[CLOUD_TASK_CREATED]", result.name);

    return NextResponse.json({
      success: true,
      message: "Đã tạo Cloud Task thử nghiệm",
      taskName: result.name,
      targetUrl,
    });
  } catch (error) {
    console.error("[CLOUD_TASK_TEST_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tạo Cloud Task",
      },
      { status: 500 },
    );
  }
}
