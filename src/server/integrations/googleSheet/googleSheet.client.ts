import "server-only";

import { google } from "googleapis";
import { createPrivateKey } from "node:crypto";

interface ServiceAccountCredentials {
  type: string;
  project_id: string;
  private_key: string;
  client_email: string;
}

export function createGoogleSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON");
  }

  let credentials: ServiceAccountCredentials;

  try {
    credentials = JSON.parse(raw) as ServiceAccountCredentials;
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON không phải JSON hợp lệ",
    );
  }

  if (
    credentials.type !== "service_account" ||
    !credentials.client_email ||
    !credentials.private_key
  ) {
    throw new Error("Invalid Service Account credentials");
  }

  try {
    createPrivateKey(credentials.private_key);
  } catch {
    throw new Error("Invalid Service Account private key");
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });

  return google.sheets({
    version: "v4",
    auth,
  });
}