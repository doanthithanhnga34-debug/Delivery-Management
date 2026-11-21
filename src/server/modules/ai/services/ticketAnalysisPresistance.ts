import "server-only";

import { createHash } from "node:crypto";
import { analyzeTicketWithAI } from "./ticketAnalysis.service";
import { getTursoClient } from "@/data/db/turso";

const ANALYSIS_VERSION = "v1";
const db = getTursoClient();

type SaveAnalysisInput = {
  ticketId: string;
  shipperId: string;
  content: string;
};

function hashContent(content: string): string {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

export async function analyzeAndSaveTicket({
  ticketId,
  shipperId,
  content,
}: SaveAnalysisInput) {
  if (!ticketId.trim() || !shipperId.trim() || !content.trim()) {
    throw new Error("Thiếu dữ liệu phân tích phiếu giao hàng");
  }

  const contentHash = hashContent(content);

  const existing = await db.execute({
    sql: `
      SELECT content_hash, analysis_version, analysis_json
      FROM ticket_analysis
      WHERE ticket_id = ?
        AND status = 'completed'
      LIMIT 1
    `,
    args: [ticketId],
  });

  const row = existing.rows[0];

  if (
    row &&
    row.content_hash === contentHash &&
    row.analysis_version === ANALYSIS_VERSION &&
    typeof row.analysis_json === "string"
  ) {
    return {
      success: true,
      cached: true,
      analysis: JSON.parse(row.analysis_json),
    };
  }

  const aiResult = await analyzeTicketWithAI(content);

  await db.execute({
    sql: `
      INSERT INTO ticket_analysis (
        ticket_id,
        shipper_id,
        content_hash,
        analysis_json,
        status,
        analysis_version,
        analyzed_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'completed', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

      ON CONFLICT(ticket_id) DO UPDATE SET
        shipper_id = excluded.shipper_id,
        content_hash = excluded.content_hash,
        analysis_json = excluded.analysis_json,
        status = 'completed',
        analysis_version = excluded.analysis_version,
        analyzed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    `,
    args: [
      ticketId,
      shipperId,
      contentHash,
      JSON.stringify(aiResult.analysis),
      ANALYSIS_VERSION,
    ],
  });

  return {
    success: true,
    cached: false,
    analysis: aiResult.analysis,
    model: aiResult.model,
    inputTokens: aiResult.inputTokens,
    outputTokens: aiResult.outputTokens,
    totalTokens: aiResult.totalTokens,
  };
}
