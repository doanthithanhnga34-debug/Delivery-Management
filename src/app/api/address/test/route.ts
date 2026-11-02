import { convertOldAddress } from "@/server/modules/address/addressConvert.service";
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
    const address = request.nextUrl.searchParams.get("address");

    if (!address?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Thiếu tham số address",
        },
        { status: 400 },
      );
    }

    const result = convertOldAddress(address);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[ADDRESS_CONVERT_ERROR]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể chuyển đổi địa chỉ",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Not found" },
      { status: 404 },
    );
  }

  try {
    const body: unknown = await request.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("address" in body) ||
      typeof body.address !== "string" ||
      !body.address.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Vui lòng nhập địa chỉ",
        },
        { status: 400 },
      );
    }

    const address = body.address.trim();

    const result = convertOldAddress(address);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[ADDRESS_CONVERT_ERROR]", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          message: "JSON body không hợp lệ",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Không thể chuyển đổi địa chỉ",
      },
      { status: 500 },
    );
  }
}