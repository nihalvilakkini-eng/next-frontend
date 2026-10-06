import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  BACKEND_URL_CONFIG_ERROR,
  forwardBackendResponse,
  getBackendUrl,
} from "@/lib/api-proxy";

export async function POST(req: Request) {
  try {
    // Get JWT from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Authentication required. Please login first.",
        },
        { status: 401 }
      );
    }

    // Get FormData from admin page
    const formData = await req.formData();
    const backendUrl = getBackendUrl();

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: BACKEND_URL_CONFIG_ERROR },
        { status: 500 }
      );
    }

    // Send product to backend
    const response = await fetch(
      `${backendUrl}/api/products/add`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return forwardBackendResponse(response);
  } catch (error) {
    console.error("Admin add product error:", error);

    return NextResponse.json(
      {
        message: "Failed to add product",
      },
      { status: 500 }
    );
  }
}