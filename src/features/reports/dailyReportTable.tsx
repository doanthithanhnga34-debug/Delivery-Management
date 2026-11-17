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
  summary,
}: DailyReportTableProps) {
  const total = summary ?? calcReportSummary(tickets);
  const isFirstPage = pageIndex === 1;

  return (
    <div className="w-[1000px] bg-white p-6 text-black">
      {isFirstPage ? (
        <>
          <h1 className="mb-4 text-[44px] font-bold">
            BÁO CÁO PHIẾU GIAO HÀNG
          </h1>
          <div className="mb-5 flex flex-wrap gap-x-8 gap-y-1 text-[28px] font-semibold">
            <span>Shipper: {shipperName}</span>
            <span>Ngày: {reportDate}</span>
            <span>Số phiếu: {total.totalTickets}</span>
            <span>Tổng ship: {formatCurrency(total.totalShippingFee)}</span>
          </div>
        </>
      ) : (
        <div className="mb-3 text-[24px] font-semibold text-zinc-500">
          {shipperName} · {reportDate}
        </div>
      )}

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
              <td className="border border-zinc-300 p-3">
                {startIndex + index + 1}
              </td>
              <td className="border border-zinc-300 p-2 text-center">
                {ticket.createdAt && (
                  <>
                    <div className="whitespace-nowrap font-medium">
                      {new Date(ticket.createdAt).toLocaleTimeString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </div>

                    <div className="whitespace-nowrap text-xs text-zinc-500">
                      {new Date(ticket.createdAt).toLocaleDateString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </>
                )}
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
                  ""}
              </td>
              <td className="border border-zinc-300 p-3">
                {ticket.analysis.payment
                  ? `${ticket.analysis.payment.label}: ${ticket.analysis.payment.amount}`
                  : ""}
              </td>
              <td className="whitespace-nowrap border border-zinc-300 p-3 text-right">
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

      {totalPages > 1 && (
        <div className="mt-3 text-right text-[22px] font-semibold text-zinc-500">
          {pageIndex}/{totalPages}
        </div>
      )}
    </div>
  );
}
// export function DailyReportTable({
//   tickets,
//   shipperName,
//   reportDate,
//   pageIndex = 1,
//   totalPages = 1,
//   startIndex = 0,
//   summary,
// }: DailyReportTableProps) {
//   const total = summary ?? calcReportSummary(tickets);

//   return (
//     <div className="w-[1400px] bg-white p-8 text-black">
//       <div className="mb-4 flex items-center justify-between">
//         <h1 className="text-4xl font-bold">BÁO CÁO PHIẾU GIAO HÀNG</h1>
//         {totalPages > 1 && (
//           <span className="rounded-lg bg-zinc-100 px-4 py-2 text-3xl font-bold">
//             Trang {pageIndex}/{totalPages}
//           </span>
//         )}
//       </div>

//       <div className="mb-6 flex gap-8 text-xl font-semibold">
//         <span>Shipper: {shipperName}</span>
//         <span>Ngày: {reportDate}</span>
//         <span>Số phiếu: {total.totalTickets}</span>
//         <span>Tổng ship: {formatCurrency(total.totalShippingFee)}</span>
//       </div>

//       <table className="w-full border-collapse text-sm">
//         {/* thead giữ nguyên như cũ */}
//         <thead>
//           <tr className="bg-sky-100">
//             <th className="border border-zinc-300 p-3 text-left">STT</th>
//             <th className="border border-zinc-300 p-3 text-left">Thời gian</th>
//             <th className="border border-zinc-300 p-3 text-left">Nội dung đầy đủ</th>
//             <th className="border border-zinc-300 p-3 text-left">Địa chỉ giao hàng</th>
//             <th className="border border-zinc-300 p-3 text-left">Thanh toán</th>
//             <th className="border border-zinc-300 p-3 text-right">Phí ship</th>
//             <th className="border border-zinc-300 p-3 text-right">Phí chành / khác</th>
//           </tr>
//         </thead>

//         <tbody>
//          {tickets.map((ticket, index) => (
//             <tr key={ticket.id} className="align-top">
//               <td className="border border-zinc-300 p-3">
//                 {startIndex + index + 1}
//               </td>
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
