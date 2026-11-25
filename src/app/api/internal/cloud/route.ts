import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const secret = process.env.INTERNAL_TEST_SECRET;
  const receivedSecret = request.headers.get("x-test-secret");

  return NextResponse.json(
    {
      success: true,
      version: "cloud-debug-v3",
      environment: process.env.VERCEL_ENV ?? "unknown",
      debug: {
        envExists: Boolean(secret),
        headerExists: Boolean(receivedSecret),
        matched: Boolean(secret) && receivedSecret === secret,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}