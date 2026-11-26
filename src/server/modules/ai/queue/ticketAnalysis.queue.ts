
import "server-only";

import { createHash } from "node:crypto";
import { getVercelOidcToken } from "@vercel/oidc";
import { ExternalAccountClient } from "google-auth-library";

type EnqueueTicketInput = {
  ticketId: string;
  shipperId: string;
  content: string;
};

type CloudTaskResponse = {
  name?: string;
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function getGoogleAccessToken(): Promise<string> {
  const projectNumber = requiredEnv("GCP_PROJECT_NUMBER");
  const poolId = requiredEnv("GCP_WORKLOAD_IDENTITY_POOL_ID");
  const providerId = requiredEnv(
    "GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID",
  );
  const enqueuerEmail = requiredEnv(
    "CLOUD_TASKS_SERVICE_ACCOUNT",
  );

  const vercelToken = await getVercelOidcToken();

  const client = ExternalAccountClient.fromJSON({
    type: "external_account",
    audience:
      `//iam.googleapis.com/projects/${projectNumber}` +
      `/locations/global/workloadIdentityPools/${poolId}` +
      `/providers/${providerId}`,
    subject_token_type:
      "urn:ietf:params:oauth:token-type:jwt",
    token_url: "https://sts.googleapis.com/v1/token",
    service_account_impersonation_url:
      "https://iamcredentials.googleapis.com/v1/" +
      `projects/-/serviceAccounts/${enqueuerEmail}` +
      ":generateAccessToken",
    subject_token_supplier: {
      getSubjectToken: async () => vercelToken,
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

export async function enqueueTicketAnalysis(
  input: EnqueueTicketInput,
) {
  const ticketId = input.ticketId.trim();
  const shipperId = input.shipperId.trim();
  const content = input.content.trim();

  if (!ticketId || !shipperId || !content) {
    throw new Error("Invalid ticket analysis payload");
  }

  const projectId = requiredEnv("GCP_PROJECT_ID");
  const location = requiredEnv("CLOUD_TASKS_LOCATION");
  const queueId = requiredEnv("CLOUD_TASKS_QUEUE");

  const workerUrl = requiredEnv("AI_WORKER_URL");
  const workerAudience = requiredEnv("AI_WORKER_AUDIENCE");

  const workerEmail = requiredEnv(
    "CLOUD_TASKS_WORKER_SERVICE_ACCOUNT",
  );

  const url = new URL(workerUrl);

  if (
    url.protocol !== "https:" ||
    url.pathname !== "/api/internal/analyze-ticket"
  ) {
    throw new Error("Invalid AI_WORKER_URL");
  }

  const parent =
    `projects/${projectId}/locations/${location}` +
    `/queues/${queueId}`;

  // Cùng ticketId sẽ tạo cùng taskName.
  const hash = createHash("sha256")
    .update(ticketId)
    .digest("hex");

  const taskName = `${parent}/tasks/ticket-${hash}`;

  const payload = Buffer.from(
    JSON.stringify({ ticketId, shipperId, content }),
    "utf8",
  ).toString("base64");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Preview có Vercel Deployment Protection.
  // Production không cần header này nếu không bật protection.
  const bypassSecret =
    process.env.VERCEL_PROTECTION_BYPASS_SECRET;

  if (bypassSecret) {
    headers["x-vercel-protection-bypass"] = bypassSecret;
  }

  const accessToken = await getGoogleAccessToken();

  const response = await fetch(
    `https://cloudtasks.googleapis.com/v2/${parent}/tasks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: {
          name: taskName,
          httpRequest: {
            httpMethod: "POST",
            url: workerUrl,
            headers,
            body: payload,
            oidcToken: {
              serviceAccountEmail: workerEmail,
              audience: workerAudience,
            },
          },
        },
      }),
      cache: "no-store",
    },
  );

  const result =
    (await response.json()) as CloudTaskResponse;
  if (response.status === 409) {
    console.warn("[AI_TASK_ALREADY_EXISTS]", {
      ticketId,
      taskName,
    });

    return {
      queued: true,
      alreadyExists: true,
      taskName,
    };
  }

  if (!response.ok || !result.name) {
    console.error("[AI_TASK_CREATE_FAILED]", {
      ticketId,
      httpStatus: response.status,
      errorCode: result.error?.status,
      errorMessage: result.error?.message,
    });

    throw new Error(
      `Cloud Tasks create failed: ${response.status} ` +
      `${result.error?.status ?? "UNKNOWN"}`,
    );
  }

  console.log("[AI_TASK_QUEUED]", {
    ticketId,
    taskName: result.name,
  });

  return {
    queued: true,
    alreadyExists: false,
    taskName: result.name,
  };
}
