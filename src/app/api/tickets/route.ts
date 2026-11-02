import { createTicket } from "@/server/modules/tickets/ticket.service";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Tickets API is working",
  });
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("shipperName" in body) ||
      !("content" in body) ||
      !("shippingFee" in body) ||
      typeof body.shipperName !== "string" ||
      typeof body.content !== "string" ||
      typeof body.shippingFee !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu không hợp lệ",
        },
        { status: 400 },
      );
    }

    console.log("[TICKET_REQUEST]", {
      shipperName: body.shipperName,
      shippingFee: body.shippingFee,
    });

    const result = await createTicket({
      shipperName: body.shipperName,
      content: body.content,
      shippingFee: body.shippingFee,
      deliveryDate: new Date().toISOString(),
    });

    console.log("[TICKET_SAVED]", result);

    return NextResponse.json(
      {
        success: true,
        message: "Đã lưu phiếu vào Google Sheets",
        data: result,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CREATE_TICKET_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lưu phiếu vào Google Sheets",
      },
      { status: 500 },
    );
  }
}
