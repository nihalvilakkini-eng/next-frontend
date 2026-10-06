import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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

        const data = await response.json();

        console.log("BACKEND PROFILE RESPONSE:", data);

        return NextResponse.json(data, {
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

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const formData = await request.formData();

        const response = await fetch(
            `${backendUrl}/api/auth/profile`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
                cache: "no-store",
            }
        );

        const data = await response.json();

        return NextResponse.json(data, {
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