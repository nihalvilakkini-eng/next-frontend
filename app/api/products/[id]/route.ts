import { NextRequest, NextResponse } from "next/server";
import { forwardBackendResponse, getBackendUrl } from "@/lib/api-proxy";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Backend URL is missing, invalid, or points to localhost in production. Configure BACKEND_URL and NEXT_PUBLIC_BACKEND_URL in the deployment environment.",
      },
      { status: 500 }
    );
  }

  try {
    const { id } = await params;
    const response = await fetch(
      `${backendUrl}/api/products/${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );

    return forwardBackendResponse(response);
  } catch (error) {
    console.error("Product details proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reach product service" },
      { status: 502 }
    );
  }
}