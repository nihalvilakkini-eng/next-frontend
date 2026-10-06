import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readResponseBody } from "@/lib/api-response";

export async function GET() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No token found",
                },
                { status: 401 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "");

        if (!backendUrl) {
            return NextResponse.json(
                { success: false, message: "Profile service is not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(
            `${backendUrl}/api/auth/profile`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        const body = await readResponseBody(response);

        if (!body.isJson) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Profile service returned a non-JSON response (HTTP ${response.status})`,
                },
                { status: response.ok ? 502 : response.status }
            );
        }

        return NextResponse.json(body.data, {
            status: response.status,
        });

    } catch (error) {
        console.error("PROFILE API ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to get profile",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No token found",
                },
                { status: 401 }
            );
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "");

        if (!backendUrl) {
            return NextResponse.json(
                { success: false, message: "Profile service is not configured" },
                { status: 500 }
            );
        }

        const formData = await request.formData();

        const response = await fetch(
            `${backendUrl}/api/auth/updateprofile`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
                cache: "no-store",
            }
        );

        const body = await readResponseBody(response);

        if (!body.isJson) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Profile service returned a non-JSON response (HTTP ${response.status})`,
                },
                { status: response.ok ? 502 : response.status }
            );
        }

        return NextResponse.json(body.data, {
            status: response.status,
        });
    } catch (error) {
        console.error("PROFILE UPDATE API ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to update profile",
            },
            { status: 500 }
        );
    }
}