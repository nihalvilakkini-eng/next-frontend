import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/`,
      {
        cache: "no-store",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          message: data.message || "Failed to fetch products",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error) {
    console.error("Products API error:", error);

    return NextResponse.json(
      {
        message: "Failed to connect to backend",
      },
      {
        status: 500,
      }
    );
  }
}