import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Please login first" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        const data = await response.json();

        console.log("CREATE ORDER RESPONSE:", data);

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);

        return NextResponse.json(
            { message: "Failed to create order" },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Please login first" },
                { status: 401 }
            );
        }

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/my-orders`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        const data = await response.json();

        console.log("MY ORDERS RESPONSE:", data);

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error("GET ORDERS ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}