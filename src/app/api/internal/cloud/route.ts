
import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Xác thực API test
  const secret = process.env.INTERNAL_TEST_SECRET;
  const receivedSecret = request.headers.get("x-test-secret");

  if (!secret || receivedSecret !== secret) {
    return NextResponse.json(
      {
        success: false,
        step: "internal_auth",
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  // 2. Kiểm tra biến môi trường
  const requiredEnv = {
    GCP_PROJECT_NUMBER: process.env.GCP_PROJECT_NUMBER,
    GCP_SERVICE_ACCOUNT_EMAIL:
      process.env.CLOUD_TASKS_SERVICE_ACCOUNT,
    GCP_WORKLOAD_IDENTITY_POOL_ID:
      process.env.GCP_WORKLOAD_IDENTITY_POOL_ID,
    GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID:
      process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID,
  };

  const missing = Object.entries(requiredEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return NextResponse.json(
      {
        success: false,
        step: "environment",
        message: "Thiếu biến môi trường",
        missing,
      },
      { status: 500 },
    );
  }

  const projectNumber = requiredEnv.GCP_PROJECT_NUMBER!;
  const serviceAccount = requiredEnv.GCP_SERVICE_ACCOUNT_EMAIL!;
  const poolId = requiredEnv.GCP_WORKLOAD_IDENTITY_POOL_ID!;
  const providerId =
    requiredEnv.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID!;

  // 3. Lấy Vercel OIDC token
  let oidcToken: string;

  try {
    oidcToken = await getVercelOidcToken();

    if (!oidcToken) {
      throw new Error("Vercel OIDC token is empty");
    }
  } catch (error) {
    console.error("[CLOUD_TEST_OIDC_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        step: "vercel_oidc",
        message: "Không lấy được Vercel OIDC token",
      },
      { status: 500 },
    );
  }

  // 4. Đổi Vercel OIDC token thành Google Access Token
  try {
    const audience =
      `//iam.googleapis.com/projects/${projectNumber}` +
      `/locations/global/workloadIdentityPools/${poolId}` +
      `/providers/${providerId}`;

    const client = ExternalAccountClient.fromJSON({
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

    if (!client) {
      throw new Error("Không tạo được Google Auth Client");
    }

    client.scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ];

    const result = await client.getAccessToken();

    if (!result.token) {
      throw new Error("Google Access Token is empty");
    }

    console.log("[CLOUD_TEST_WIF_SUCCESS]");

    return NextResponse.json(
      {
        success: true,
        step: "google_wif",
        message: "Vercel kết nối Google Cloud WIF thành công",
        authenticated: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("[CLOUD_TEST_WIF_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        step: "google_wif",
        message: "Không thể xác thực Google Cloud WIF",
      },
      { status: 500 },
    );
  }
}
