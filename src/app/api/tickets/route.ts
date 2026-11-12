import { analyzeTicket } from "@/server/modules/message/extractMessage.service";
import { getTicketSheet } from "@/server/modules/tickets/ticket.repository";
import { createTicket } from "@/server/modules/tickets/ticket.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shipperName = searchParams.get("shipperName")?.trim().toUpperCase();
    if (!shipperName) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu tên shipper",
        },
        { status: 400 },
      );
    }
    const tickets = await getTicketSheet(shipperName);
    const analyzedTickets = tickets.map((ticket) => analyzeTicket(ticket));
    return NextResponse.json({
      success: true,
      total: analyzedTickets.length,
      data: analyzedTickets,
    });
  } catch (error) {
    console.error("[GET_TICKETS_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lấy lịch sử phiếu",
      },
      { status: 500 },
    );
  }
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
      !("otherFee" in body) ||
      typeof body.shipperName !== "string" ||
      typeof body.content !== "string" ||
      typeof body.shippingFee !== "number" ||
      typeof body.otherFee !== "number"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Dữ liệu không hợp lệ",
        },
        { status: 400 },
      );
    }
    const deliveryDate = new Date().toISOString();

    console.log("[CREATE_TICKET] Delivery Date:", deliveryDate);
    const result = await createTicket({
      shipperName: body.shipperName,
      content: body.content,
      shippingFee: body.shippingFee,
      otherFee: body.otherFee,
      deliveryDate: new Date().toISOString(),
    });
    console.log("Result log", result);
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
