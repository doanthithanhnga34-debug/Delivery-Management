import { enqueueTicketAnalysis } from "@/server/modules/ai/queue/ticketAnalysis.queue";
import { getCompletedTicketAnalyses } from "@/server/modules/ai/services/analysisRepo";
import { mergeTicketAnalysis } from "@/server/modules/ai/services/ticketAnalysis.mapper";
import { analyzeAndSaveTicket } from "@/server/modules/ai/services/ticketAnalysisPresistance";
import { analyzeTicket } from "@/server/modules/message/extractMessage.service";
import { getTicketSheet } from "@/server/modules/tickets/ticket.repository";
import { createTicket } from "@/server/modules/tickets/ticket.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const startedAt = performance.now();

  try {
    const { searchParams } = new URL(request.url);

    const shipperName = searchParams
      .get("shipperName")
      ?.trim()
      .toUpperCase();

    if (!shipperName) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu tên shipper",
        },
        { status: 400 },
      );
    }

    // 1. Google Sheets
    const sheetStartedAt = performance.now();

    const tickets = await getTicketSheet(shipperName);

    const sheetDuration = performance.now() - sheetStartedAt;

    // 2. Regex
    const regexStartedAt = performance.now();

    const regexTickets = tickets.map(analyzeTicket);
    const ticketIds = tickets.map((ticket) => ticket.id);

    const regexDuration = performance.now() - regexStartedAt;

    let analyzedTickets = regexTickets;

    let aiDuration = 0;
    let mergeDuration = 0;
    let aiRecords = 0;

    // 3. AI database
    if (ticketIds.length > 0) {
      const aiStartedAt = performance.now();

      try {
        const aiMap =
          await getCompletedTicketAnalyses(ticketIds);

        aiDuration = performance.now() - aiStartedAt;
        aiRecords = aiMap.size;

        // 4. Merge
        const mergeStartedAt = performance.now();

        analyzedTickets = regexTickets.map((ticket) =>
          mergeTicketAnalysis(
            ticket,
            aiMap.get(ticket.id),
          ),
        );

        mergeDuration =
          performance.now() - mergeStartedAt;
      } catch (error) {
        aiDuration = performance.now() - aiStartedAt;

        console.error("[GET_TICKETS_AI_FALLBACK]", {
          shipperName,
          message:
            error instanceof Error
              ? error.message
              : "Unknown error",
        });
      }
    }

    console.log("[GET_TICKETS_PERFORMANCE]", {
      shipperName,
      totalTickets: tickets.length,
      aiRecords,
      googleSheetsMs: Math.round(sheetDuration),
      regexMs: Math.round(regexDuration),
      aiDatabaseMs: Math.round(aiDuration),
      mergeMs: Math.round(mergeDuration),
      totalMs: Math.round(performance.now() - startedAt),
    });

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
type CreateTicketRequest = {
  shipperName: string;
  content: string;
  shippingFee: number;
  otherFee: number;
};

function isValidTicketInput(
  value: unknown,
): value is CreateTicketRequest {
  if (!value || typeof value !== "object") {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.shipperName === "string" &&
    data.shipperName.trim().length > 0 &&
    typeof data.content === "string" &&
    data.content.trim().length > 0 &&
    data.content.length <= 20000 &&
    typeof data.shippingFee === "number" &&
    Number.isSafeInteger(data.shippingFee) &&
    data.shippingFee >= 0 &&
    typeof data.otherFee === "number" &&
    Number.isSafeInteger(data.otherFee) &&
    data.otherFee >= 0
  );
}
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "JSON không hợp lệ",
      },
      { status: 400 },
    );
  }

  if (
  !isValidTicketInput(body)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu không hợp lệ",
      },
      { status: 400 },
    );
  }
  const shipperName = body.shipperName.trim().toUpperCase();
  const content = body.content.trim();
  const deliveryDate = new Date().toISOString();
  let ticket: Awaited<ReturnType<typeof createTicket>>;


   try {
    ticket = await createTicket({
      shipperName,
      content,
      shippingFee: body.shippingFee,
      otherFee: body.otherFee,
      deliveryDate: new Date().toISOString(),
    });

    console.log("[TICKET_SAVED]", {
      ticketId: ticket.ticketId,
      shipperName,
    });
  } catch (error) {
    console.error("[CREATE_TICKET_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể lưu phiếu giao hàng",
      },
      { status: 500 },
    );
  }
  let aiStatus: "queued" | "queue_failed" = "queue_failed";

  try {
    await enqueueTicketAnalysis({
      ticketId: ticket.ticketId,
      shipperId: shipperName.toUpperCase(),
      content,
    });

    aiStatus = "queued";
  } catch (error) {
    console.error("[AI_QUEUE_ERROR]", {
      ticketId: ticket.ticketId,
      error,
    });
  }

  return NextResponse.json(
    {
      success: true,
      message: "Đã lưu phiếu vào Google Sheets",
      data: ticket,
      ai: {
        status: aiStatus,
      },
    },
    { status: 201 },
  );
}
