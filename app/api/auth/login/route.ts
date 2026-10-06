import { NextRequest, NextResponse } from "next/server";
import {
  extractHtmlMessage,
  isJsonObject,
  readResponseBody,
} from "@/lib/api-response";
import { getBackendUrl } from "@/lib/api-proxy";

export async function POST(request: NextRequest) {
  let credentials: unknown;

  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Login request must contain valid JSON" },
      { status: 400 }
    );
  }

  if (
    !isJsonObject(credentials) ||
    typeof credentials.email !== "string" ||
    typeof credentials.password !== "string"
  ) {
    return NextResponse.json(
      { success: false, message: "Email and password are required" },
      { status: 400 }
    );
  }

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
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
      cache: "no-store",
    });

    const body = await readResponseBody(response);

    if (!body.isJson) {
      const message = extractHtmlMessage(body.text);
      const invalidCredentials = /invalid email or password/i.test(message);

      console.error(
        "Login service returned a non-JSON response:",
        response.status,
        response.headers.get("content-type")
      );

      return NextResponse.json(
        {
          success: false,
          message: invalidCredentials
            ? "Invalid email or password"
            : `Login service returned a non-JSON response (HTTP ${response.status})`,
        },
        { status: invalidCredentials ? 401 : response.ok ? 502 : response.status }
      );
    }

    if (!isJsonObject(body.data)) {
      return NextResponse.json(
        { success: false, message: "Login service returned an unexpected response" },
        { status: response.ok ? 502 : response.status }
      );
    }

    return NextResponse.json(body.data, { status: response.status });
  } catch (error) {
    console.error("Login proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reach login service" },
      { status: 502 }
    );
  }
}