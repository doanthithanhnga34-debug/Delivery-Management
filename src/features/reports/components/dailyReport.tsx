import { Button } from "@/components/ui/button";
import { AnalyzedTicket } from "@/types/ticket.types";
import { formatDate, formatDateTime } from "@/utils/date";
import { Download, Loader2 } from "lucide-react";
import { exportReportImage } from "../exportReportImage";
import { useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/toast";
import { DailyReportTable } from "../dailyReportTable";

interface DailyReportExportProps {
  tickets: AnalyzedTicket[];
  shipperName: string;
  initialDate?: string;
}
const TIME_ZONE = "Asia/Ho_Chi_Minh";
const REPORT_WIDTH = 900;

function getDateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}
function formatMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value) + "đ";
}
function ReportTicket({
  ticket,
  index,
}: {
  ticket: AnalyzedTicket;
  index: number;
}) {
  const { deliveryAddress, payment } = ticket.analysis;

  return (
    <article
      style={{
        padding: 20,
        border: "1px solid #e4e4e7",
        borderRadius: 12,
        backgroundColor: "#ffffff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <strong style={{ color: "#2563eb", fontSize: 16 }}>
          {index + 1}. Phiếu #{ticket.id}
        </strong>

        <span style={{ color: "#52525b", fontSize: 14 }}>
          {formatDateTime(ticket.createdAt)}
        </span>
      </div>

      {/* Địa chỉ giao hàng */}
      <div
        style={{
          padding: 12,
          backgroundColor: "#eff6ff",
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 14,
          lineHeight: 1.6,
          overflowWrap: "anywhere",
        }}
      >
        <strong style={{ color: "#1d4ed8" }}>
          Địa chỉ giao hàng:
        </strong>{" "}
        <span style={{ color: "#1e40af" }}>
          {deliveryAddress ?? "Chưa xác định"}
        </span>
      </div>

      {/* Payment */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "baseline",
          marginBottom: 12,
          fontSize: 14,
          flexWrap: "wrap",
        }}
      >
        <strong>Thanh toán:</strong>
        <span>
          {payment
            ? `${payment.label}: ${payment.amount}`
            : "Không có thông tin"}
        </span>
      </div>
      <div
        style={{
          padding: 14,
          backgroundColor: "#fafafa",
          borderRadius: 8,
          border: "1px solid #f4f4f5",
        }}
      >
        <strong
          style={{
            display: "block",
            fontSize: 14,
            marginBottom: 8,
          }}
        >
          Nội dung đơn hàng
        </strong>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "#3f3f46",
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}
        >
          {ticket.content}
        </div>
      </div>

      {/* Phí ship của phiếu */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid #e4e4e7",
          marginTop: 16,
          paddingTop: 14,
          fontSize: 16,
        }}
      >
        <strong>Phí ship</strong>
        <strong style={{ color: "#15803d" }}>
          {ticket.shippingFee == null
            ? "Chưa có"
            : formatMoney(ticket.shippingFee)}
        </strong>
      </div>
    </article>
  );
}


export function DailyReportExport({
  tickets,
  shipperName,
  initialDate,
}: DailyReportExportProps) {
  const [selectedDate, setSelectedDate] = useState(
    () => initialDate ?? getDateKey(new Date()),
  );
  const reportRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={reportRef}
      style={{
        width: 1400,
        padding: 24,
        backgroundColor: "#ffffff",
      }}
    >
      <DailyReportTable
        shipperName={shipperName}
        reportDate={formatDate(selectedDate)}
        tickets={tickets}
      />
    </div>
  );
}