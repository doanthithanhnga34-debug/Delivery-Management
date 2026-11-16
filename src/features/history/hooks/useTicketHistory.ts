import { AnalyzedTicket, } from "@/types/ticket.types";
import { useCallback, useEffect, useRef, useState } from "react";

interface TicketResponse {
  success: boolean;
  data?: AnalyzedTicket[];
  message?: string;
}

// export function useTicketHistory(shipperName: string) {
//   const [tickets, setTickets] = useState<AnalyzedTicket[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [loadedShipper, setLoadedShipper] = useState<string | null>(null);

//   const isLoading = Boolean(shipperName) && loadedShipper !== shipperName;
//   useEffect(() => {
//     if (!shipperName.trim()) return;
//     const controller = new AbortController();
//     async function fetchTickets() {
//       try {
//         const response = await fetch(
//           `/api/tickets?shipperName=${encodeURIComponent(shipperName)}`,
//           {
//             signal: controller.signal,
//             cache: "no-store",
//           },
//         );
//         const result = (await response.json()) as TicketResponse;

//         if (!response.ok || !result.success) {
//           throw new Error(result.message ?? "Không thể tải lịch sử phiếu");
//         }

//         if (!controller.signal.aborted) {
//           setTickets(result.data ?? []);
//           setError(null);

//           console.log("[TICKETS_STATE_UPDATED]", result.data?.length);
//         }
//       } catch (err) {
//         if (controller.signal.aborted) return;
//         setError(
//           err instanceof Error ? err.message : "Có lỗi khi tải lịch sử phiếu",
//         );
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoadedShipper(shipperName);
//         }
//       }
//     }
//     void fetchTickets();
//     return () => controller.abort();
//   }, [shipperName]);
//   return { tickets, isLoading, error };
// }

interface TicketApiResponse {
  success: boolean;
  data?: AnalyzedTicket[];
  message?: string;
}

async function fetchTickets(
  shipperName: string,
  signal?: AbortSignal,
): Promise<AnalyzedTicket[]> {
  const response = await fetch(
    `/api/tickets?shipperName=${encodeURIComponent(shipperName)}`,
    {
      cache: "no-store",
      signal,
    },
  );

  const result = (await response.json()) as TicketApiResponse;

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Không thể tải lịch sử phiếu.");
  }

  return Array.isArray(result.data) ? result.data : [];
}

export function useTicketHistory(shipperName: string) {
  const name = shipperName.trim();

  const [tickets, setTickets] = useState<AnalyzedTicket[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestIdRef = useRef(0);

  // Tự động tải khi mở History hoặc đổi shipper
  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    if (!name) {
      return () => controller.abort();
    }

    async function loadInitialTickets() {
      try {
        const data = await fetchTickets(name, controller.signal);

        if (
          controller.signal.aborted ||
          requestId !== requestIdRef.current
        ) {
          return;
        }

        setTickets(data);
        setError(null);
        setLoadedFor(name);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (requestId !== requestIdRef.current) return;

        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải lịch sử phiếu.",
        );

        setLoadedFor(name);
      }
    }

    void loadInitialTickets();

    return () => {
      controller.abort();
      requestIdRef.current += 1;
    };
  }, [name]);

  // Chỉ gọi khi người dùng Pull to Refresh
  const refetch = useCallback(async (): Promise<void> => {
    if (!name) return;

    const requestId = ++requestIdRef.current;

    try {
      const data = await fetchTickets(name);

      if (requestId !== requestIdRef.current) return;

      setTickets(data);
      setError(null);
      setLoadedFor(name);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;

      // Giữ danh sách cũ, không unmount TicketList.
      console.error("[REFRESH_TICKETS_ERROR]", err);

      throw err;
    }
  }, [name]);

  const isLoading = Boolean(name) && loadedFor !== name;

  return {
    tickets: loadedFor === name ? tickets : [],
    isLoading,
    error: loadedFor === name ? error : null,
    refetch,
  };
}
