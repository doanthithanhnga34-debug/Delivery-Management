import { NextRequest, NextResponse } from "next/server";
import { getShippingQuote } from "@/server/modules/shipping/shipping.service";

// export async function GET() {
//   if (process.env.NODE_ENV !== "development") {
//     return NextResponse.json(
//       { success: false, message: "Not found" },
//       { status: 404 }
//     );
//   }

//   try {
//     const rows = await getShippingRates();

//     return NextResponse.json({
//       success: true,
//       totalRows: rows.length,
//       preview: rows,
//     });
//   } catch (error: unknown) {
//     const err = error as {
//       message?: string;
//       code?: number | string;
//       response?: {
//         status?: number;
//         data?: {
//           error?: {
//             code?: number;
//             status?: string;
//             message?: string;
//           };
//         };
//       };
//     };

//     console.error("[SHIPPING_SHEET_ERROR]", {
//       code: err.code,
//       status: err.response?.status,
//       apiStatus: err.response?.data?.error?.status,
//       message: err.response?.data?.error?.message ?? err.message,
//     });

//     return NextResponse.json(
//       {
//         success: false,
//         error:
//           err.response?.data?.error?.message ??
//           err.message ??
//           "Unknown error",
//         code: err.response?.status ?? err.code,
//       },
//       { status: 500 }
//     );
//   }
// }

export async function GET(request: NextRequest) {
  try {
    const district = request.nextUrl.searchParams.get("district");
    const ward = request.nextUrl.searchParams.get("ward");

    if (!district || !ward) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu quận hoặc phường",
        },
        { status: 400 },
      );
    }

    const result = await getShippingQuote(district, ward);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Shipping lookup error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tra cứu phí ship",
      },
      { status: 500 },
    );
  }
}