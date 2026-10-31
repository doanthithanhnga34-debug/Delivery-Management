import { matchAddress } from "@/server/modules/address/addressMatcher.service";
import { normalizeAddress } from "@/server/modules/address/addressNomarlize.service";
import { getShippingRates } from "@/server/modules/shipping/shipping.repository";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 },
    );
  }

  try {
    const input = request.nextUrl.searchParams.get("address");

    if (!input?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu tham số address",
        },
        { status: 400 },
      );
    }

    // 1. Chuẩn hóa địa chỉ
    const normalized = normalizeAddress(input);

    // 2. Lấy bảng phí ship từ Google Sheets
    const rates = await getShippingRates();

    // 3. Đối chiếu địa chỉ
    // Chưa có bảng chuyển đổi phường cũ → mới
    const matched = matchAddress(normalized, rates, []);

    return NextResponse.json({
      success: true,
      input,
      normalized,
      matched,
      totalRates: rates.length,
    });
  } catch (error) {
    console.error("[ADDRESS_MATCHER_TEST]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể kiểm tra địa chỉ",
      },
      { status: 500 },
    );
  }
}