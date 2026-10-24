import { NextResponse } from "next/server";
import { getRawShippingRules } from "@/server/modules/shipping/shipping.repository";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 }
    );
  }

  try {
    const rows = await getRawShippingRules();

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      preview: rows,
    });
  } catch (error: unknown) {
    const err = error as {
      message?: string;
      code?: number | string;
      response?: {
        status?: number;
        data?: {
          error?: {
            code?: number;
            status?: string;
            message?: string;
          };
        };
      };
    };

    console.error("[SHIPPING_SHEET_ERROR]", {
      code: err.code,
      status: err.response?.status,
      apiStatus: err.response?.data?.error?.status,
      message: err.response?.data?.error?.message ?? err.message,
    });

    return NextResponse.json(
      {
        success: false,
        error:
          err.response?.data?.error?.message ??
          err.message ??
          "Unknown error",
        code: err.response?.status ?? err.code,
      },
      { status: 500 }
    );
  }
}