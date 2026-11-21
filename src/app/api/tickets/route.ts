import { enqueueTicketAnalysis } from "@/server/modules/ai/queue/ticketAnalysis.queue";
import { analyzeAndSaveTicket } from "@/server/modules/ai/services/ticketAnalysisPresistance";
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
    typeof body.otherFee !== "number" ||
    !Number.isFinite(body.shippingFee) ||
    !Number.isFinite(body.otherFee) ||
    !body.shipperName.trim() ||
    !body.content.trim()
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu không hợp lệ",
      },
      { status: 400 },
    );
  }
  const shipperName = body.shipperName.trim();
  const content = body.content.trim();
  const deliveryDate = new Date().toISOString();

  console.log("[CREATE_TICKET] Delivery Date:", deliveryDate);
  const result = await createTicket({
    shipperName,
    content,
    shippingFee: body.shippingFee,
    otherFee: body.otherFee,
    deliveryDate,
  });

  console.log("Result log", result);

  let aiStatus: "queued" | "queue_failed" = "queue_failed";

  try {
    await enqueueTicketAnalysis({
      ticketId: result.ticketId,
      shipperId: shipperName.toUpperCase(),
      content,
    });

    aiStatus = "queued";
  } catch (error) {
    console.error("[AI_QUEUE_ERROR]", {
      ticketId: result.ticketId,
      error,
    });
  }

  return NextResponse.json(
    {
      success: true,
      message: "Đã lưu phiếu vào Google Sheets",
      data: result,
      ai: {
        status: aiStatus,
      },
    },
    { status: 201 },
  );
}
