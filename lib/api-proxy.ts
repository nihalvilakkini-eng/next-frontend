import { NextResponse } from "next/server";
import { extractHtmlMessage, readResponseBody } from "@/lib/api-response";

export const BACKEND_URL_CONFIG_ERROR =
  "Backend URL unavailable. Set BACKEND_URL to the deployed backend origin in Vercel Project Settings > Environment Variables (Production), then redeploy. Also set NEXT_PUBLIC_BACKEND_URL to the same origin for product and profile images.";

export function getBackendUrl() {
  const candidates = [
    process.env.BACKEND_URL,
    process.env.NEXT_PUBLIC_BACKEND_URL,
  ];

  for (const configuredUrl of candidates) {
    if (!configuredUrl?.trim()) {
      continue;
    }

    try {
      const url = new URL(configuredUrl.trim());

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        continue;
      }

      if (
        process.env.NODE_ENV === "production" &&
        ["localhost", "127.0.0.1", "::1"].includes(url.hostname)
      ) {
        continue;
      }

      const pathname = url.pathname.replace(/\/+$/, "");
      url.pathname = /\/api$/i.test(pathname)
        ? pathname.slice(0, -4) || "/"
        : pathname || "/";

      return url.toString().replace(/\/+$/, "");
    } catch {
      continue;
    }
  }

  console.error("No valid backend URL is configured", {
    backendUrlSet: Boolean(process.env.BACKEND_URL),
    publicBackendUrlSet: Boolean(process.env.NEXT_PUBLIC_BACKEND_URL),
    vercelEnvironment: process.env.VERCEL_ENV || "local",
  });

  return null;
}

export async function forwardBackendResponse(
  response: Response,
  fallbackMessage?: string
) {
  const body = await readResponseBody(response);

  if (fallbackMessage && response.status >= 500) {
    return NextResponse.json(
      { success: false, message: fallbackMessage },
      { status: response.status }
    );
  }

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
        fallbackMessage ||
        message ||
        `Backend returned a non-JSON response (HTTP ${response.status})`,
      backendStatus: response.status,
      backendContentType: response.headers.get("content-type"),
    },
    { status: response.ok ? 502 : response.status }
  );
}