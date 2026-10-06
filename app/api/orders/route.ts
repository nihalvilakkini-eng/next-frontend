import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
    BACKEND_URL_CONFIG_ERROR,
    forwardBackendResponse,
    getBackendUrl,
} from "@/lib/api-proxy";

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
        const backendUrl = getBackendUrl();

        if (!backendUrl) {
            return NextResponse.json(
                { success: false, message: BACKEND_URL_CONFIG_ERROR },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${backendUrl}/api/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        return forwardBackendResponse(response);
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

        const backendUrl = getBackendUrl();

        if (!backendUrl) {
            return NextResponse.json(
                { success: false, message: BACKEND_URL_CONFIG_ERROR },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${backendUrl}/api/orders/my-orders`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        return forwardBackendResponse(response);
    } catch (error) {
        console.error("GET ORDERS ERROR:", error);

        return NextResponse.json(
            { message: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}