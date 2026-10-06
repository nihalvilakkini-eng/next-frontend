import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { token, role } = await req.json();

        if (!token || !role) {
            return NextResponse.json(
                { message: "Missing token or role" },
                { status: 400 }
            );
        }

        const response = NextResponse.json({
            message: "Cookie set successfully!",
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        response.cookies.set("role", role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error("Cookie error:", error);

        return NextResponse.json(
            { message: "Server error while setting cookies" },
            { status: 500 }
        );
    }
}