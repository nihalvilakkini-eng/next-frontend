import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { forwardBackendResponse, getBackendUrl } from "@/lib/api-proxy";

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

        return forwardBackendResponse(response);

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

        return forwardBackendResponse(response);
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