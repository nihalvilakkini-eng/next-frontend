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

  if (!isJsonObject(credentials)) {
    return NextResponse.json(
      { success: false, message: "Invalid login request" },
      { status: 400 }
    );
  }

  if (typeof credentials.email !== "string" || !credentials.email.trim()) {
    return NextResponse.json(
      { success: false, message: "Email is required" },
      { status: 400 }
    );
  }

  if (typeof credentials.password !== "string" || !credentials.password) {
    return NextResponse.json(
      { success: false, message: "Password is required" },
      { status: 400 }
    );
  }

  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to sign in right now. Please try again.",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
      cache: "no-store",
    });

    const body = await readResponseBody(response);

    if (!body.isJson) {
      const message = extractHtmlMessage(body.text);
      const invalidCredentials = /invalid (?:email|credentials|password)|email or password/i.test(message);

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
            : "Unable to sign in right now. Please try again.",
        },
        { status: invalidCredentials || response.status === 401 ? 401 : response.ok ? 502 : response.status }
      );
    }

    if (!isJsonObject(body.data)) {
      return NextResponse.json(
        { success: false, message: "Unable to sign in right now. Please try again." },
        { status: response.ok ? 502 : response.status }
      );
    }

    const backendMessage = typeof body.data.message === "string"
      ? body.data.message
      : "";
    if (
      response.status === 401 ||
      /invalid (?:email|credentials|password)|email or password/i.test(backendMessage)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (response.status >= 500) {
      return NextResponse.json(
        { success: false, message: "Unable to sign in right now. Please try again." },
        { status: response.status }
      );
    }

    return NextResponse.json(body.data, { status: response.status });
  } catch (error) {
    console.error("Login proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to connect. Please try again." },
      { status: 502 }
    );
  }
}