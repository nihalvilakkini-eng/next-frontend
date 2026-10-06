"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import Link from "next/link";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { isJsonObject, readResponseBody } from "@/lib/api-response";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        const trimmedEmail = email.trim();

        // Required validation
        if (!trimmedEmail && !password) {
            setError("Email and password are required");
            return;
        }

        if (!trimmedEmail) {
            setError("Email is required");
            return;
        }

        if (!password) {
            setError("Password is required");
            return;
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);

            // =========================
            // LOGIN API
            // =========================
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: trimmedEmail,
                    password,
                }),
                cache: "no-store",
            });

            const body = await readResponseBody(response);

            if (!body.isJson || !isJsonObject(body.data)) {
                setError("Login service returned an invalid response");
                return;
            }

            const data = body.data;

            // =========================
            // BACKEND ERROR
            // =========================
            if (!response.ok || data.success === false) {
                setError(
                    typeof data.message === "string"
                        ? data.message
                        : "Invalid email or password"
                );
                return;
            }

            // =========================
            // GET TOKEN
            // =========================
            const token = typeof data.accessToken === "string"
                ? data.accessToken
                : "";

            // =========================
            // GET ROLE
            // =========================
            const userData = isJsonObject(data.data) ? data.data : null;
            const role = userData && typeof userData.role === "string"
                ? userData.role
                : "";

            if (!token) {
                setError("Token not received");
                return;
            }

            if (!role) {
                setError("Role not received");
                return;
            }

            // =========================
            // SET COOKIE
            // =========================
            const cookieResponse = await fetch(
                "/api/auth/set-cookie",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        role,
                    }),
                }
            );

            const cookieBody = await readResponseBody(cookieResponse);
            const cookieData = isJsonObject(cookieBody.data)
                ? cookieBody.data
                : null;

            if (!cookieBody.isJson || !cookieData || !cookieResponse.ok) {
                setError(
                    cookieData && typeof cookieData.message === "string"
                        ? cookieData.message
                        : "Could not set login cookie"
                );
                return;
            }

            window.dispatchEvent(new Event("auth-changed"));

            // =========================
            // LOGIN SUCCESS
            // =========================
            console.log("LOGIN SUCCESSFUL");
            console.log("FINAL ROLE:", role);

            // =========================
            // ADMIN / USER REDIRECT
            // =========================
            if (String(role).toLowerCase() === "admin") {
                console.log("ADMIN LOGIN → /admin");

                router.replace("/admin");
            } else {
                console.log("USER LOGIN → /");

                router.replace("/");
            }

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "var(--background)",
                padding: "20px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    backgroundColor: "white",
                    padding: "30px",
                    borderRadius: "12px",
                    boxShadow:
                        "0 4px 15px rgba(0,0,0,0.1)",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "25px",
                    }}
                >
                    Login
                </h1>

                <form onSubmit={handleLogin}>
                    {/* EMAIL */}
                    <div
                        style={{
                            marginBottom: "15px",
                        }}
                    >
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter your email"
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "5px",
                                border: "1px solid #ccc",
                                borderRadius: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {/* PASSWORD */}
                    <div style={{ marginBottom: "15px" }}>
                        <label>Password</label>

                        <div style={{ position: "relative", marginTop: "5px" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                placeholder="Enter your password"
                                style={{
                                    width: "100%",
                                    padding: "10px 42px 10px 10px",
                                    border: "1px solid #ccc",
                                    borderRadius: "6px",
                                    boxSizing: "border-box",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                aria-pressed={showPassword}
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    right: "10px",
                                    transform: "translateY(-50%)",
                                    border: 0,
                                    background: "transparent",
                                    color: "#555",
                                    cursor: "pointer",
                                    padding: "4px",
                                }}
                            >
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <p
                            style={{
                                color: "red",
                                textAlign: "center",
                                marginBottom: "15px",
                            }}
                        >
                            {error}
                        </p>
                    )}

                    {/* LOGIN BUTTON */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "11px",
                            border: "none",
                            borderRadius: "6px",
                            cursor: loading
                                ? "not-allowed"
                                : "pointer",
                            backgroundColor: "#000",
                            color: "#fff",
                        }}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>
                </form>

                {/* REGISTER LINK */}
                <div
                    style={{
                        textAlign: "center",
                        marginTop: "22px",
                        paddingTop: "18px",
                        borderTop: "1px solid #e5e5e5",
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            color: "#555",
                            fontSize: "14px",
                        }}
                    >
                        Don't have an account?{" "}
                       <Link
  href="/register"
  style={{
        display: "inline-block",
        marginTop: "8px",
        padding: "8px 14px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        color: "#111827",
        fontWeight: 600,
        fontSize: "14px",
        textDecoration: "none",
  }}
>
    Create Account
</Link>
                    </p>
                </div>

            </div>
        </div>
    );
}