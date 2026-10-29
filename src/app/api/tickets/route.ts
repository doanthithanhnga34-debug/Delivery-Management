import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Tickets API is working",
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  console.log("Received:", body);

  return NextResponse.json({
    success: true,
    data: body,
  });
}