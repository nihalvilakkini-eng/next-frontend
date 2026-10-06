import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/update/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Admin update product error:", error);

    return NextResponse.json(
      { message: "Failed to update product" },
      { status: 500 }
    );
  }
}