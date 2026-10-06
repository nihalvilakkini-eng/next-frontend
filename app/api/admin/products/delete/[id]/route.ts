import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  BACKEND_URL_CONFIG_ERROR,
  forwardBackendResponse,
  getBackendUrl,
} from "@/lib/api-proxy";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authentication required. Please login first." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const backendUrl = getBackendUrl();

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: BACKEND_URL_CONFIG_ERROR },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${backendUrl}/api/products/delete/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return forwardBackendResponse(response);
  } catch (error) {
    console.error("Admin delete product error:", error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}