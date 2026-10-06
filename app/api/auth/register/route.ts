import { NextRequest, NextResponse } from "next/server";
import { forwardBackendResponse, getBackendUrl } from "@/lib/api-proxy";

export async function POST(request: NextRequest) {
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
    const formData = await request.formData();
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    return forwardBackendResponse(response);
  } catch (error) {
    console.error("Registration proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reach registration service" },
      { status: 502 }
    );
  }
}