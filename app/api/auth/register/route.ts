import { NextRequest, NextResponse } from "next/server";
import {
  BACKEND_URL_CONFIG_ERROR,
  forwardBackendResponse,
  getBackendUrl,
} from "@/lib/api-proxy";

export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        message: BACKEND_URL_CONFIG_ERROR,
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