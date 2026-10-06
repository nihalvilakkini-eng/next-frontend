import { NextResponse } from "next/server";
import { isJsonObject, readResponseBody } from "@/lib/api-response";
import { getBackendUrl } from "@/lib/api-proxy";

export async function GET() {
  try {
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

    const response = await fetch(
      `${backendUrl}/api/products/`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const body = await readResponseBody(response);

    if (!body.isJson) {
      console.error(
        "Products service returned a non-JSON response:",
        response.status,
        response.headers.get("content-type")
      );

      return NextResponse.json(
        {
          success: false,
          message: `Product service returned a non-JSON response (HTTP ${response.status})`,
        },
        { status: response.ok ? 502 : response.status }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        isJsonObject(body.data)
          ? body.data
          : { success: false, message: `Product request failed (HTTP ${response.status})` },
        { status: response.status }
      );
    }

    const data = body.data;
    const products = Array.isArray(data)
      ? data
      : isJsonObject(data) && Array.isArray(data.products)
        ? data.products
        : isJsonObject(data) && Array.isArray(data.data)
          ? data.data
          : null;

    if (!products) {
      return NextResponse.json(
        { success: false, message: "Product service returned an unexpected response" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      Array.isArray(data)
        ? { products }
        : { ...(data as Record<string, unknown>), products },
      { status: response.status }
    );
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