import { NextRequest, NextResponse } from "next/server";
import {
  forwardBackendResponse,
  getBackendUrl,
} from "@/lib/api-proxy";

export async function POST(request: NextRequest) {
  const backendUrl = getBackendUrl();

  if (!backendUrl) {
    return NextResponse.json(
      {
        success: false,
        message: "Registration could not be completed. Please try again.",
      },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const requiredFields = [
      ["firstName", "First name is required"],
      ["lastName", "Last name is required"],
      ["email", "Email is required"],
      ["password", "Password is required"],
      ["phone", "Phone number is required"],
    ] as const;

    for (const [field, message] of requiredFields) {
      const value = formData.get(field);
      if (typeof value !== "string" || !value.trim()) {
        return NextResponse.json(
          { success: false, message },
          { status: 400 }
        );
      }
    }

    const phone = formData.get("phone");
    if (typeof phone !== "string" || !/^\d{10}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: typeof phone === "string" && /\D/.test(phone)
            ? "Phone number must contain only digits"
            : "Phone number must be 10 digits",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: "POST",
      body: formData,
      cache: "no-store",
    });

    return forwardBackendResponse(
      response,
      "Registration could not be completed. Please try again."
    );
  } catch (error) {
    console.error("Registration proxy error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to connect. Please try again." },
      { status: 502 }
    );
  }
}