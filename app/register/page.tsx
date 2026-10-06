"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";

const namePattern = /^\p{L}[\p{L}\p{M}]*(?:[ '\u2019-]\p{L}[\p{L}\p{M}]*)*$/u;

export default function RegisterPage() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState("");
    const [profileImage, setProfileImage] = useState<File | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!firstName.trim()) {
            setError("First name is required");
            return;
        }

        if (!lastName.trim()) {
            setError("Last name is required");
            return;
        }

        if (!namePattern.test(firstName.trim())) {
            setError("First name can only contain letters, spaces, hyphens, or apostrophes");
            return;
        }

        if (!namePattern.test(lastName.trim())) {
            setError("Last name can only contain letters, spaces, hyphens, or apostrophes");
            return;
        }

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!password) {
            setError("Password is required");
            return;
        }

        try {
            setLoading(true);

            const backendUrl =
                process.env.NEXT_PUBLIC_BACKEND_URL;

            console.log("BACKEND URL:", backendUrl);
            console.log(
                "REGISTER URL:",
                `${backendUrl}/api/auth/register`
            );

            const formData = new FormData();

            formData.append("firstName", firstName.trim());
            formData.append("lastName", lastName.trim());
            formData.append("email", email.trim());
            formData.append("password", password);
            formData.append("phone", phone.trim());

            if (profileImage) {
                formData.append("profileImage", profileImage);
            }

            const response = await fetch(
                `${backendUrl}/api/auth/register`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            console.log(
                "REGISTER STATUS:",
                response.status
            );

            const text = await response.text();

            console.log(
                "REGISTER RESPONSE:",
                text
            );

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                console.error(
                    "Backend returned non-JSON response:",
                    text
                );

                setError(
                    "Server returned an invalid response"
                );

                return;
            }

            console.log(
                "REGISTER DATA:",
                data
            );

            if (!response.ok) {
                setError(
                    data.message ||
                    "Registration failed"
                );

                return;
            }

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setTimeout(() => {
                router.push("/login");
            }, 1000);

        } catch (error) {
            console.error(
                "REGISTER FETCH ERROR:",
                error
            );

            setError(
                "Unable to connect to server. Please check whether backend is running."
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
                    maxWidth: "450px",
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
                    Register
                </h1>

                <form onSubmit={handleRegister}>

                    {/* FIRST NAME */}
                    <div style={{ marginBottom: "15px" }}>
                        <label>First Name</label>

                        <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) =>
                                setFirstName(e.target.value)
                            }
                            placeholder="Enter first name"
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

                    {/* LAST NAME */}
                    <div style={{ marginBottom: "15px" }}>
                        <label>Last Name</label>

                        <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) =>
                                setLastName(e.target.value)
                            }
                            placeholder="Enter last name"
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

                    {/* EMAIL */}
                    <div style={{ marginBottom: "15px" }}>
                        <label>Email</label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Enter email"
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
                                placeholder="Enter password"
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

                    {/* PHONE */}
                    <div style={{ marginBottom: "15px" }}>
                        <label>Phone</label>

                        <input
                            type="text"
                            value={phone}
                            onChange={(e) =>
                                setPhone(e.target.value)
                            }
                            placeholder="Enter phone number"
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

                    {/* PROFILE IMAGE */}
                    <div style={{ marginBottom: "15px" }}>
                        <label>Profile Image</label>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setProfileImage(
                                    e.target.files?.[0] || null
                                )
                            }
                            style={{
                                width: "100%",
                                marginTop: "8px",
                            }}
                        />
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

                    {/* SUCCESS */}
                    {success && (
                        <p
                            style={{
                                color: "green",
                                textAlign: "center",
                                marginBottom: "15px",
                            }}
                        >
                            {success}
                        </p>
                    )}

                    {/* REGISTER BUTTON */}
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
                            ? "Registering..."
                            : "Register"}
                    </button>
                </form>

                {/* LOGIN LINK */}
                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                    }}
                >
                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            router.push("/login")
                        }
                        style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            textDecoration: "underline",
                            color: "#4f46e5",
                            fontWeight: "bold",
                        }}
                    >
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
}