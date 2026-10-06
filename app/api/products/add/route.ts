import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  BACKEND_URL_CONFIG_ERROR,
  forwardBackendResponse,
  getBackendUrl,
} from "@/lib/api-proxy";

export async function GET() {
  try {
    const backendUrl = getBackendUrl();

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: BACKEND_URL_CONFIG_ERROR },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${backendUrl}/api/products/`,
      { cache: "no-store" }
    );

    return forwardBackendResponse(response);
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

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    const backendUrl = getBackendUrl();

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: BACKEND_URL_CONFIG_ERROR },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const response = await fetch(`${backendUrl}/api/products/add`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      cache: "no-store",
    });

    return forwardBackendResponse(response);
  } catch (error) {
    console.error("Add product proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reach product service" },
      { status: 502 }
    );
  }
}