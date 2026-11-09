import { AnalyzedTicket, } from "@/types/ticket.types";
import { useEffect, useState } from "react";

interface TicketResponse {
  success: boolean;
  data?: AnalyzedTicket[];
  message?: string;
}

export function useTicketHistory(shipperName: string) {
  const [tickets, setTickets] = useState<AnalyzedTicket[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadedShipper, setLoadedShipper] = useState<string | null>(null);

  const isLoading = Boolean(shipperName) && loadedShipper !== shipperName;
  useEffect(() => {
    if (!shipperName.trim()) return;
    const controller = new AbortController();
    async function fetchTickets() {
      try {
        const response = await fetch(
          `/api/tickets?shipperName=${encodeURIComponent(shipperName)}`,
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );
        const result = (await response.json()) as TicketResponse;

        if (!response.ok || !result.success) {
          throw new Error(result.message ?? "Không thể tải lịch sử phiếu");
        }

        if (!controller.signal.aborted) {
          setTickets(result.data ?? []);
          setError(null);

          console.log("[TICKETS_STATE_UPDATED]", result.data?.length);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error ? err.message : "Có lỗi khi tải lịch sử phiếu",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadedShipper(shipperName);
        }
      }
    }
    void fetchTickets();
    return () => controller.abort();
  }, [shipperName]);
  return { tickets, isLoading, error };
}
