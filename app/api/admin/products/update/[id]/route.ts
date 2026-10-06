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
    const formData = await req.formData();
    const backendUrl = getBackendUrl();

    if (!backendUrl) {
      return NextResponse.json(
        { success: false, message: BACKEND_URL_CONFIG_ERROR },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${backendUrl}/api/products/update/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    return forwardBackendResponse(response);
  } catch (error) {
    console.error("Admin update product error:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}