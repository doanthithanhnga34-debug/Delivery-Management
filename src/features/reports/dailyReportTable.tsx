import type { AnalyzedTicket } from "@/types/ticket.types";
import { formatCurrency } from "@/utils/formatter";

interface DailyReportTableProps {
  tickets: AnalyzedTicket[];
  shipperName: string;
  reportDate: string;
  pageIndex?: number;
  totalPages?: number;
  startIndex?: number;
  showSummary?: boolean;
  summary?: ReportSummary;
}

export interface ReportSummary {
  totalTickets: number;
  totalShippingFee: number;
  totalOtherFee: number;
}

export function calcReportSummary(tickets: AnalyzedTicket[]): ReportSummary {
  return {
    totalTickets: tickets.length,
    totalShippingFee: tickets.reduce((s, t) => s + (t.shippingFee ?? 0), 0),
    totalOtherFee: tickets.reduce(
      (s, t) => s + (t.transportFee ?? 0) + (t.otherFee ?? 0),
      0,
    ),
  };
}
function getAddress(ticket: AnalyzedTicket): string {
  const { carrier, deliveryAddress } = ticket.analysis;

  const carrierText = carrier.hasCarrier
    ? [carrier.name, carrier.address].filter((v) => v?.trim()).join(" - ")
    : "";

  return carrierText || deliveryAddress?.trim() || "";
}
export function DailyReportTable({
  tickets,
  shipperName,
  reportDate,
  pageIndex = 1,
  totalPages = 1,
  startIndex = 0,
  showSummary = true,
  summary,
}: DailyReportTableProps) {
  const total = summary ?? calcReportSummary(tickets);

  return (
    <div className="w-[720px] bg-white p-5 text-black">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-bold leading-tight">
          BÁO CÁO PHIẾU GIAO HÀNG
        </h1>
        {totalPages > 1 && (
          <span className="shrink-0 rounded-md bg-zinc-100 px-2.5 py-1 text-base font-semibold">
            Trang {pageIndex}/{totalPages}
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-lg font-semibold">
        <span>Shipper: {shipperName}</span>
        <span>Ngày: {reportDate}</span>
      </div>

      <table className="w-full table-fixed border-collapse text-base">
        <thead>
          <tr className="bg-sky-100">
            <th className="w-[84px] border border-zinc-300 p-2 text-left">
              STT / Giờ
            </th>
            <th className="border border-zinc-300 p-2 text-left">
              Nội dung / Địa chỉ giao
            </th>
            <th className="w-[130px] border border-zinc-300 p-2 text-left">
              Thanh toán
            </th>
            <th className="w-[120px] border border-zinc-300 p-2 text-right">
              Phí
            </th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket, index) => {
            const address = getAddress(ticket);
            const content = ticket.content?.trim() ?? "";
            const otherFee = (ticket.transportFee ?? 0) + (ticket.otherFee ?? 0);
            const payment = ticket.analysis.payment;

            return (
              <tr key={ticket.id} className="align-top">
                <td className="border border-zinc-300 p-2">
                  <div className="font-bold">{startIndex + index + 1}</div>
                  <div className="whitespace-nowrap text-sm text-zinc-600">
                    {ticket.createdAt
                      ? new Date(ticket.createdAt).toLocaleString("vi-VN", {
                          timeZone: "Asia/Ho_Chi_Minh",
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                        })
                      : ""}
                  </div>
                </td>

                <td className="whitespace-pre-wrap break-words border border-zinc-300 p-2">
                  <div>{content}</div>
                  {address && address !== content && (
                    <div className="mt-1 border-t border-dashed border-zinc-300 pt-1 text-zinc-700">
                      📍 {address}
                    </div>
                  )}
                </td>

                <td className="break-words border border-zinc-300 p-2">
                  {payment ? `${payment.label}: ${payment.amount}` : ""}
                </td>

                <td className="border border-zinc-300 p-2 text-right">
                  <div className="font-semibold">
                    {formatCurrency(ticket.shippingFee ?? 0)}
                  </div>
                  {otherFee > 0 && (
                    <div className="text-sm text-zinc-600">
                      +{formatCurrency(otherFee)}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showSummary && (
        <div className="mt-4 rounded-lg border-2 border-zinc-800 p-3 text-lg font-bold">
          <div className="flex justify-between">
            <span>Tổng số phiếu</span>
            <span>{total.totalTickets}</span>
          </div>
          <div className="flex justify-between">
            <span>Tổng tiền ship</span>
            <span>{formatCurrency(total.totalShippingFee)}</span>
          </div>
          {total.totalOtherFee > 0 && (
            <div className="flex justify-between">
              <span>Tổng phí chành / khác</span>
              <span>{formatCurrency(total.totalOtherFee)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// export function DailyReportTable({
//   tickets,
//   shipperName,
//   reportDate,
// }: DailyReportTableProps) {
//   const totalShippingFee = tickets.reduce(
//     (sum, ticket) => sum + (ticket.shippingFee ?? 0),
//     0,
//   );

//   return (
//     <div className="w-[1400px] bg-white p-8 text-black">
//       <h1 className="mb-4 text-4xl font-bold">BÁO CÁO PHIẾU GIAO HÀNG</h1>

//       <div className="mb-6 flex gap-8 text-xl font-semibold">
//         <span>Shipper: {shipperName}</span>
//         <span>Ngày: {reportDate}</span>
//         <span>Số phiếu: {tickets.length}</span>
//         <span>Tổng ship: {formatCurrency(totalShippingFee)}</span>
//       </div>

//       <table className="w-full border-collapse text-sm">
//         <thead>
//           <tr className="bg-sky-100">
//             <th className="border border-zinc-300 p-3 text-left">STT</th>
//             <th className="border border-zinc-300 p-3 text-left">Thời gian</th>
//             <th className="border border-zinc-300 p-3 text-left">
//               Nội dung đầy đủ
//             </th>
//             <th className="border border-zinc-300 p-3 text-left">
//               Địa chỉ giao hàng
//             </th>
//             <th className="border border-zinc-300 p-3 text-left">Thanh toán</th>
//             <th className="border border-zinc-300 p-3 text-right">Phí ship</th>
//             <th className="border border-zinc-300 p-3 text-right">
//               Phí chành / khác
//             </th>
//           </tr>
//         </thead>

//         <tbody>
//           {tickets.map((ticket, index) => (
//             <tr key={ticket.id} className="align-top">
//               <td className="border border-zinc-300 p-3">{index + 1}</td>
//               <td className="border border-zinc-300 p-3 whitespace-nowrap">
//                 {ticket.createdAt
//                   ? new Date(ticket.createdAt).toLocaleString("vi-VN", {
//                       timeZone: "Asia/Ho_Chi_Minh",
//                     })
//                   : ""}
//               </td>
//               <td className="border border-zinc-300 p-3 whitespace-pre-wrap break-words max-w-[380px]">
//                 {ticket.content}
//               </td>
//               <td className="border border-zinc-300 p-3 whitespace-pre-wrap break-words max-w-[250px]">
//                 {(ticket.analysis.carrier.hasCarrier &&
//                   [
//                     ticket.analysis.carrier.name,
//                     ticket.analysis.carrier.address,
//                   ]
//                     .filter((value) => value?.trim())
//                     .join(" - ")) ||
//                   ticket.analysis.deliveryAddress?.trim() ||
//                   ticket.content}
//               </td>
//               <td className="border border-zinc-300 p-3">
//                 {ticket.analysis.payment
//                   ? `${ticket.analysis.payment.label}: ${ticket.analysis.payment.amount}`
//                   : ""}
//               </td>
//               <td className="border border-zinc-300 p-3 text-right">
//                 {formatCurrency(ticket.shippingFee ?? 0)}
//               </td>
//               <td className="border border-zinc-300 p-3 text-right">
//                 {formatCurrency(
//                   (ticket.transportFee ?? 0) + (ticket.otherFee ?? 0),
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
