import type { AnalyzedTicket } from "@/types/ticket.types";
import { formatCurrency } from "@/utils/formatter";

interface DailyReportTableProps {
  tickets: AnalyzedTicket[];
  shipperName: string;
  reportDate: string;
}

export function DailyReportTable({
  tickets,
  shipperName,
  reportDate,
}: DailyReportTableProps) {
  const totalShippingFee = tickets.reduce(
    (sum, ticket) => sum + (ticket.shippingFee ?? 0),
    0,
  );

  return (
    <div className="w-[1400px] bg-white p-8 text-black">
      <h1 className="mb-4 text-4xl font-bold">BÁO CÁO PHIẾU GIAO HÀNG</h1>

      <div className="mb-6 flex gap-8 text-xl font-semibold">
        <span>Shipper: {shipperName}</span>
        <span>Ngày: {reportDate}</span>
        <span>Số phiếu: {tickets.length}</span>
        <span>Tổng ship: {formatCurrency(totalShippingFee)}</span>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-sky-100">
            <th className="border border-zinc-300 p-3 text-left">STT</th>
            <th className="border border-zinc-300 p-3 text-left">Thời gian</th>
            <th className="border border-zinc-300 p-3 text-left">
              Nội dung đầy đủ
            </th>
            <th className="border border-zinc-300 p-3 text-left">
              Địa chỉ giao hàng
            </th>
            <th className="border border-zinc-300 p-3 text-left">Thanh toán</th>
            <th className="border border-zinc-300 p-3 text-right">Phí ship</th>
            <th className="border border-zinc-300 p-3 text-right">
              Phí chành / khác
            </th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket, index) => (
            <tr key={ticket.id} className="align-top">
              <td className="border border-zinc-300 p-3">{index + 1}</td>
              <td className="border border-zinc-300 p-3 whitespace-nowrap">
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })
                  : ""}
              </td>
              <td className="border border-zinc-300 p-3 whitespace-pre-wrap break-words max-w-[380px]">
                {ticket.content}
              </td>
              <td className="border border-zinc-300 p-3 whitespace-pre-wrap break-words max-w-[250px]">
                {(ticket.analysis.carrier.hasCarrier &&
                  [
                    ticket.analysis.carrier.name,
                    ticket.analysis.carrier.address,
                  ]
                    .filter((value) => value?.trim())
                    .join(" - ")) ||
                  ticket.analysis.deliveryAddress?.trim() ||
                  ticket.content}
              </td>
              <td className="border border-zinc-300 p-3">
                {ticket.analysis.payment
                  ? `${ticket.analysis.payment.label}: ${ticket.analysis.payment.amount}`
                  : ""}
              </td>
              <td className="border border-zinc-300 p-3 text-right">
                {formatCurrency(ticket.shippingFee ?? 0)}
              </td>
              <td className="border border-zinc-300 p-3 text-right">
                {formatCurrency(
                  (ticket.transportFee ?? 0) + (ticket.otherFee ?? 0),
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
