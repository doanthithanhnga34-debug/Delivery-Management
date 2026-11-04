// import { convertOldAddress } from "@/server/modules/address/addressConvert.service";
// import { extractAddresses } from "@/server/modules/address/addressExtractor.service";
// import { ShippingReportRow } from "@/types/report.types";
// import "server-only";


// interface ReportTicket {
//     id: string;
//     createdAt: string;
//     content: string;
//     shippingFee: number;
// }

// export async function buildDailyShippingReport(shipperName:string, date:string, tickets:ReportTicket[]):Promise<DailyShippingReport> {
//     const rows:ShippingReportRow[] = [];

//     for(const ticket of tickets){
//         const row:ShippingReportRow ={
//             ticketId:ticket.id,
//             createdAt:ticket.createdAt,
//             content:ticket.content,
//             actualShippingFee:ticket.shippingFee,
//             calculatedShippingFee:null,
//             calculationStatus:"not_found",
//             oldDistrict:null,
//             newWard:null
//         }

//         const addresses = extractAddresses(ticket.content);
//         const deliveryAddress = addresses.find((address) => address.type === "delivery");

//         if(!deliveryAddress){
//             row.calculationStatus ="not_applicable"
//             rows.push(row);
//             continue
//         }

//         const converted = convertOldAddress(deliveryAddress.text)
//         if(converted.status === "check"){
//             row.calculationStatus ="needs_review";
//             rows.push(row);
//             continue;
//         }
//         if(converted.status === "not_found"){
//             row.calculationStatus = "not_found";
//             rows.push(row);
//             continue
//         }
//         row.oldDistrict = converted.candidate.oldDistrict || null;
//         row.newWard = converted.candidate.newWard;

//         if(!row.oldDistrict || !row.newWard){
//             row.calculationStatus ="needs_review";
//             rows.push(row);
//             continue;
//         }

//         const quote= await getS
//     }