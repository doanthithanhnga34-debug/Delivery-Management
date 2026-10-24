// import { NextResponse } from "next/server";
// import { createTicket } from "@/server/modules/tickets/ticket.service";

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();

//     const result = await createTicket(body);

//     return NextResponse.json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     console.error("[POST /api/tickets]", error);

//     return NextResponse.json(
//       {
//         success: false,
//         message: "Không thể tạo phiếu",
//       },
//       { status: 500 }
//     );
//   }
// }