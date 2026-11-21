export async function GET(request: Request) {
  const secret = process.env.INTERNAL_TEST_SECRET;
  const receivedSecret = request.headers.get("x-test-secret");

  if (!secret || receivedSecret !== secret) {
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
        debug: {
          envExists: Boolean(secret),
          headerExists: Boolean(receivedSecret),
          matched: Boolean(secret) && receivedSecret === secret,
        },
      },
      { status: 401 },
    );
  }

  // Giữ nguyên phần kết nối Google Cloud phía dưới
}