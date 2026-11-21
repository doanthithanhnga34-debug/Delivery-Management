import { CloudTasksClient } from "@google-cloud/tasks";
import { createHash } from "node:crypto";

const client = new CloudTasksClient();

type EnqueueTicketInput = {
  ticketId: string;
  shipperId: string;
  content: string;
};

export async function enqueueTicketAnalysis(
  input: EnqueueTicketInput,
) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.CLOUD_TASKS_LOCATION;
  const queueId = process.env.CLOUD_TASKS_QUEUE;
  const workerUrl = process.env.AI_WORKER_URL;
  const serviceAccount = process.env.CLOUD_TASKS_SERVICE_ACCOUNT;
  const audience = process.env.AI_WORKER_AUDIENCE;

  if (
    !projectId ||
    !location ||
    !queueId ||
    !workerUrl ||
    !serviceAccount ||
    !audience
  ) {
    throw new Error("Thiếu cấu hình Cloud Tasks");
  }

  const parent = client.queuePath(
    projectId,
    location,
    queueId,
  );

  const hash = createHash("sha256")
    .update(input.ticketId)
    .digest("hex");

  const taskName = `${parent}/tasks/ticket-${hash}`;

  const payload = Buffer.from(
    JSON.stringify(input),
  );

  try {
    const [task] = await client.createTask({
      parent,
      task: {
        name: taskName,
        httpRequest: {
          httpMethod: "POST",
          url: workerUrl,
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
          oidcToken: {
            serviceAccountEmail: serviceAccount,
            audience,
          },
        },
      },
    });

    return {
      queued: true,
      taskName: task.name,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 6
    ) {
      return {
        queued: true,
        taskName,
      };
    }

    throw error;
  }
}