import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

  const secret = process.env.INTERNAL_TEST_SECRET;

  if (
    !secret ||
    request.headers.get("x-test-secret") !== secret
  ) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const projectId = process.env.GCP_PROJECT_ID!;
    const projectNumber = process.env.GCP_PROJECT_NUMBER!;
    const serviceAccount = process.env.GCP_SERVICE_ACCOUNT_EMAIL!;
    const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID!;
    const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID!;

    const client = ExternalAccountClient.fromJSON({
      type: "external_account",
      audience:
        `//iam.googleapis.com/projects/${projectNumber}` +
        `/locations/global/workloadIdentityPools/${poolId}` +
        `/providers/${providerId}`,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
      token_url: "https://sts.googleapis.com/v1/token",
      service_account_impersonation_url:
        `https://iamcredentials.googleapis.com/v1/projects/-/` +
        `serviceAccounts/${serviceAccount}:generateAccessToken`,
      subject_token_supplier: {
        getSubjectToken: getVercelOidcToken,
      },
    });

    if (!client) {
      throw new Error("Không tạo được Google Auth Client");
    }

    client.scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ];

    const tokenResult = await client.getAccessToken();

    if (!tokenResult.token) {
      throw new Error("Không lấy được Google Access Token");
    }

    // Chỉ đọc thông tin queue, không tạo task.
    const queueUrl =
      `https://cloudtasks.googleapis.com/v2/projects/${projectId}` +
      `/locations/asia-southeast1/queues/ticket-ai-queue`;

    const response = await fetch(queueUrl, {
      headers: {
        Authorization: `Bearer ${tokenResult.token}`,
      },
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(
      {
        success: response.ok,
        message: response.ok
          ? "Vercel đã kết nối Google Cloud Tasks"
          : "Không thể đọc Cloud Tasks Queue",
        status: response.status,
        queue: response.ok ? data.name : undefined,
        error: response.ok ? undefined : data.error,
      },
      { status: response.ok ? 200 : response.status },
    );
  } catch (error) {
    console.error("[CLOUD_TASKS_TEST_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Lỗi kết nối Google Cloud",
      },
      { status: 500 },
    );
  }
}