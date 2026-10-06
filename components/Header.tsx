"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function Header() {
    const router = useRouter();

    const [role, setRole] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const getProfile = async () => {
            try {
                const response = await fetch("/api/auth/profile", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                const data = await response.json();

                console.log("PROFILE STATUS:", response.status);
                console.log("PROFILE RESPONSE:", data);

                if (response.ok) {
                    const userRole =
                        data.data?.role ||
                        data.data?.userRole ||
                        data.role ||
                        "";

                    setRole(String(userRole).toLowerCase());
                    setIsLoggedIn(true);
                } else {
                    setRole("");
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error("Profile error:", error);
                setRole("");
                setIsLoggedIn(false);
            } finally {
                setLoading(false);
            }
        };

        getProfile();

        const handleAuthChange = () => getProfile();
        window.addEventListener("auth-changed", handleAuthChange);

        return () => {
            window.removeEventListener("auth-changed", handleAuthChange);
        };
    }, []);

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            console.log("LOGOUT RESPONSE:", data);

            if (!response.ok) {
                throw new Error(data.message || "Logout failed");
            }

            localStorage.removeItem("token");
            localStorage.removeItem("role");

            setRole("");
            setIsLoggedIn(false);

            router.push("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="relative mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20">

                {/* LOGO */}
                <Link href="/" className="text-2xl font-extrabold tracking-tight text-slate-900">
                    SHOELY
                </Link>

                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="site-navigation"
                    className="flex h-10 w-10 items-center justify-center rounded-md text-xl text-slate-800 hover:bg-slate-100 md:hidden"
                >
                    {mobileMenuOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
                </button>

                <nav
                    id="site-navigation"
                    aria-label="Main navigation"
                    className={`${mobileMenuOpen ? "flex" : "hidden"} absolute left-0 right-0 top-full z-50 flex-col gap-1 border-b border-slate-200 bg-white p-3 shadow-lg md:static md:z-auto md:flex md:w-auto md:flex-row md:items-center md:gap-2 md:border-0 md:bg-transparent md:p-0 md:shadow-none`}
                >

                    {/* HOME */}
                    <Link
                        href="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 md:w-auto md:px-4 md:py-2"
                    >
                        Home
                    </Link>

                    {/* PRODUCTS */}
                    <Link
                        href="/#products"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 md:w-auto md:px-4 md:py-2"
                    >
                        Products
                    </Link>

                    {/* BRANDS */}
                    <Link
                        href="/#brands"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 md:w-auto md:px-4 md:py-2"
                    >
                        Brands
                    </Link>

                    {/* ADMIN */}
                    {isLoggedIn && role === "admin" && (
                        <Link
                            href="/admin"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 md:w-auto md:px-4 md:py-2"
                        >
                            Admin
                        </Link>
                    )}

                    {/* CONTACT */}
                    <Link
                        href="/#contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full whitespace-nowrap rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 md:w-auto md:px-4 md:py-2"
                    >
                        Contact
                    </Link>

                    {/* PROFILE ICON */}
                    {!loading && isLoggedIn && (
                        <Link
                            href="/profile"
                            title="Profile"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Profile"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600 md:ml-2 md:h-10 md:w-10 md:justify-center md:rounded-full md:border md:border-slate-300 md:bg-white md:px-0 md:py-0 md:text-xl"
                        >
                            <span aria-hidden="true">👤</span>
                            <span className="md:hidden">Profile</span>
                        </Link>
                    )}

                    {/* LOGIN */}
                    {!loading && !isLoggedIn && (
                        <Link
                            href="/login"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full whitespace-nowrap rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 md:w-auto md:px-5 md:py-2.5"
                        >
                            Login
                        </Link>
                    )}

                    {/* LOGOUT */}
                    {!loading && isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="w-full whitespace-nowrap rounded-lg bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-red-500 md:ml-2 md:w-auto md:px-5 md:py-2.5 md:text-center"
                        >
                            Logout
                        </button>
                    )}

                </nav>
            </div>
        </header>
    );
}