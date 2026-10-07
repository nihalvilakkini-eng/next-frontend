import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
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
                    message: "Unable to load profile. Please try again.",
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

        return forwardBackendResponse(
            response,
            "Unable to load profile. Please try again."
        );

    } catch (error) {
        console.error("PROFILE API ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to load profile. Please try again.",
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
                    message: "Profile update could not be completed. Please try again.",
                },
                { status: 500 }
            );
        }

        const formData = await request.formData();
        const phone = formData.get("phone");

        if (typeof phone !== "string" || !phone.trim()) {
            return NextResponse.json(
                { success: false, message: "Phone number is required" },
                { status: 400 }
            );
        }

        if (typeof phone !== "string") {
            return NextResponse.json(
                { success: false, message: "Phone number must contain only digits" },
                { status: 400 }
            );
        }

        if (typeof phone === "string" && phone && /\D/.test(phone)) {
            return NextResponse.json(
                { success: false, message: "Phone number must contain only digits" },
                { status: 400 }
            );
        }

        if (typeof phone === "string" && phone.length > 0 && phone.length < 10) {
            return NextResponse.json(
                { success: false, message: "Phone number must be at least 10 digits" },
                { status: 400 }
            );
        }

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

        return forwardBackendResponse(
            response,
            "Profile update could not be completed. Please try again."
        );
    } catch (error) {
        console.error("PROFILE UPDATE API ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to connect. Please try again.",
            },
            { status: 500 }
        );
    }
}