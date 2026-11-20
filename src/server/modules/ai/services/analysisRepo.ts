import { createHash } from "crypto";
import {
  TicketAnalysis,
  TicketAnalysisSchema,
} from "../schema/ticketAnalysis.schema";
import { getTursoClient } from "@/data/db/turso";

export type AnalysisStatus = "pending" | "completed" | "failed" | "review";

export interface StoredAnalysis {
  ticketId: string;
  shipperId: string;
  contentHash: string;
  status: AnalysisStatus;
  analysisVersion: number;
  analysis: TicketAnalysis | null;
}

export function hashTicketContent(content: string): string {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

export async function getTicketAnalysis(
  ticketId: string,
): Promise<StoredAnalysis | null> {
  const db = getTursoClient();
  const result = await db.execute({
    sql: `SELECT ticket_id ,
        shipper_id,
        content_hash,
        status,
       analysis_json,
       analysis_version
       FROM ticket_analysis
       WHERE ticket_id = ?
       LIMIT 1`,
    args: [ticketId],
  });

  const row = result.rows[0];
  if (!row) return null;
  return {
    ticketId: String(row.ticket_id),
    shipperId: String(row.shipper_id),
    contentHash: String(row.content_hash),
    status: row.status as AnalysisStatus,
    analysisVersion: Number(row.analysis_version),
    analysis:
      row.analysis_json == null
        ? null
        : TicketAnalysisSchema.parse(JSON.parse(String(row.analysis_json))),
  };
}

export async function saveTicketAnalysis(params:{
     ticketId: string;
      shipperId: string;
      content: string;
      analysis: TicketAnalysis;
      analysisVersion?: number;
}):Promise<void>{
    const db = getTursoClient();
    const now = Math.floor(Date.now() /1000);
    const analysis = TicketAnalysisSchema.parse(params.analysis);

    await db.execute({
        sql: `
      INSERT INTO ticket_analysis (
        ticket_id,
        shipper_id,
        content_hash,
        analysis_json,
        status,
        analysis_version,
        created_at,
        analyzed_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?)

      ON CONFLICT(ticket_id)
      DO UPDATE SET
        shipper_id = excluded.shipper_id,
        content_hash = excluded.content_hash,
        analysis_json = excluded.analysis_json,
        status = 'completed',
        analysis_version = excluded.analysis_version,
        analyzed_at = excluded.analyzed_at,
        updated_at = excluded.updated_at
    `,
        args: [
          params.ticketId,
          params.shipperId,
          hashTicketContent(params.content),
          JSON.stringify(analysis),
          params.analysisVersion ?? 1,
          now,
          now,
          now,
        ],
    })
}


export async function deleteExpiredAnalyses(
  retentionDays = 60,
): Promise<number> {
  const db = getTursoClient();

  const cutoff = Math.floor(Date.now() / 1000)
    - retentionDays * 24 * 60 * 60;

  const result = await db.execute({
    sql: `
      DELETE FROM ticket_analysis
      WHERE created_at < ?
        AND status = 'completed'
    `,
    args: [cutoff],
  });

  return result.rowsAffected;
}