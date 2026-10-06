import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
    BACKEND_URL_CONFIG_ERROR,
    forwardBackendResponse,
    getBackendUrl,
} from "@/lib/api-proxy";

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
                    message: BACKEND_URL_CONFIG_ERROR,
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
                    message: BACKEND_URL_CONFIG_ERROR,
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