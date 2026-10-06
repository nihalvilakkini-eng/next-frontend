import { NextResponse } from "next/server";
import { extractHtmlMessage, readResponseBody } from "@/lib/api-response";

export function getBackendUrl() {
  const configuredUrl =
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!configuredUrl) {
    return null;
  }

  try {
    const url = new URL(configuredUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    if (
      process.env.NODE_ENV === "production" &&
      ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
    ) {
      return null;
    }

    return url.toString().replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export async function forwardBackendResponse(response: Response) {
  const body = await readResponseBody(response);

  if (body.isJson) {
    return NextResponse.json(body.data, { status: response.status });
  }

  const message = extractHtmlMessage(body.text);

  console.error(
    "Backend returned a non-JSON response:",
    response.status,
    response.headers.get("content-type"),
    message || "No readable error message"
  );

  return NextResponse.json(
    {
      success: false,
      message:
        message ||
        `Backend returned a non-JSON response (HTTP ${response.status})`,
      backendStatus: response.status,
      backendContentType: response.headers.get("content-type"),
    },
    { status: response.ok ? 502 : response.status }
  );
}