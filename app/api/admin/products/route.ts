import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    // Send product to backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/add`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    console.log("BACKEND ADD PRODUCT RESPONSE:", data);

    return NextResponse.json(data, {
      status: response.status,
    });
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