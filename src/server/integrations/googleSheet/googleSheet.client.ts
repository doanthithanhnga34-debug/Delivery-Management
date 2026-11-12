import "server-only";

import { google } from "googleapis";
import { createPrivateKey } from "node:crypto";

interface ServiceAccountCredentials {
  type?: string;
  project_id?: string;
  private_key?: string;
  client_email?: string;
}

function getGoogleCredentials() {
  const rawJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();

  let clientEmail: string | undefined;
  let privateKey: string | undefined;

  if (rawJson) {
    let credentials: ServiceAccountCredentials;

    try {
      credentials = JSON.parse(rawJson) as ServiceAccountCredentials;
    } catch {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON không hợp lệ");
    }

    if (credentials.type !== "service_account") {
      throw new Error("Invalid Google Service Account type");
    }

    clientEmail = credentials.client_email;
    privateKey = credentials.private_key;
  } else {
    clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
    privateKey = process.env.GOOGLE_PRIVATE_KEY;
  }

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google Sheets credentials");
  }

  privateKey = privateKey
    .replace(/\\n/g, "\n")
    .trim();

  try {
    createPrivateKey(privateKey);
  } catch {
    throw new Error("Invalid Google Service Account private key");
  }

  return {
    clientEmail,
    privateKey,
  };
}

export function createGoogleSheetsClient() {
  const { clientEmail, privateKey } = getGoogleCredentials();

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return google.sheets({
    version: "v4",
    auth,
  });
}