import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Products API error:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch products",
      },
      {
        status: 500,
      }
    );
  }
}