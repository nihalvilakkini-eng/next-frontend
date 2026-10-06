"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiEye, FiEyeOff, FiSearch, FiX } from "react-icons/fi";
import { SHOE_BRANDS } from "@/lib/brands";

type Product = {
  _id: string;
  name: string;
  price: number;
  brand?: string;
  category: string;
  description: string;
  image: string;
};

const getProductImageUrl = (image: string) => {
  const normalizedImage = image.replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalizedImage)) {
    return normalizedImage;
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!backendUrl) {
    return normalizedImage;
  }

  return new URL(
    normalizedImage.replace(/^\/+/, ""),
    `${backendUrl.replace(/\/+$/, "")}/`
  ).toString();
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Login states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  // Login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check logged-in user and role
  useEffect(() => {
    const getUserRole = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        setIsLoggedIn(false);
      }
    };

    getUserRole();
  }, []);

  // Get products
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch products");
          return;
        }

        setProducts(data.data || data.products || []);
      } catch (error) {
        console.error("Products fetch error:", error);
        setError("Something went wrong while loading products");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // Login
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (!response.ok) {
        setLoginMessage(data.message || "Login failed");
        return;
      }

      const token =
        data.accessToken ||
        data.data?.accessToken ||
        data.data?.token ||
        data.token;
      const userRole = data.data?.role;

      if (!token || !userRole) {
        setLoginMessage("Login response is missing token or role");
        return;
      }

      const cookieResponse = await fetch("/api/auth/set-cookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          role: userRole,
        }),
      });

      if (!cookieResponse.ok) {
        setLoginMessage("Could not save login session");
        return;
      }

      window.dispatchEvent(new Event("auth-changed"));

      setLoginMessage("Login successful!");
      setIsLoggedIn(true);

      setLoginEmail("");
      setLoginPassword("");
    } catch (error) {
      console.error("Login error:", error);
      setLoginMessage("Something went wrong");
    }
  };

  // Brands
  const brands = [
    "All",
    ...Array.from(
      new Set(
        [
          ...SHOE_BRANDS,
          ...products
            .map((product) => product.brand)
            .filter((brand): brand is string => Boolean(brand)),
        ]
      )
    ),
  ];

  // Filter products
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((product) => {
    const matchesBrand =
      selectedBrand === "All" ||
      product.brand?.toLowerCase() === selectedBrand.toLowerCase();
    const searchableText = [
      product.name,
      product.brand,
      product.category,
      product.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesBrand && searchableText.includes(normalizedSearchQuery);
  });

  return (
    <main className="min-h-screen bg-background text-gray-900">

      {/* ================= HERO ================= */}
      <section className="shoe-hero px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">

          <h2 className="text-5xl font-bold tracking-tight">
            Step Into Style
          </h2>

          <p className="mt-5 max-w-xl text-lg">
            Find Your Perfect Pair 👟
          </p>

          <a
            href="#products"
            className="mt-8 inline-block rounded-full bg-white px-7 py-3 font-semibold text-[#27382f] hover:bg-surface-soft"
          >
            Shop Now
          </a>

        </div>
      </section>

   {/* ================= LOGIN ================= */}
{!isLoggedIn && (
  <section
    id="login"
    className="bg-surface-soft px-6 py-16"
  >
    <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-md">

      <h2 className="mb-6 text-center text-2xl font-bold">
        Login
      </h2>

      <form
        onSubmit={handleLogin}
        className="space-y-5"
      >

        <div>
          <label className="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Password
          </label>

          <div className="relative">
            <input
              type={showLoginPassword ? "text" : "password"}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 outline-none focus:border-black"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowLoginPassword(!showLoginPassword)}
              aria-label={showLoginPassword ? "Hide password" : "Show password"}
              aria-pressed={showLoginPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-900"
            >
              {showLoginPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-black py-3 font-semibold text-white hover:bg-gray-800"
        >
          Login
        </button>

      </form>

      {loginMessage && (
        <p className="mt-4 text-center text-sm">
          {loginMessage}
        </p>
      )}

      {/* REGISTER LINK */}
      <div className="mt-6 border-t border-gray-200 pt-5 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}

          <Link
            href="/register"
            className="ml-2 inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-900 no-underline transition hover:border-gray-900 hover:bg-gray-50"
          >
            Create Account
          </Link>
        </p>
      </div>

    </div>
  </section>
)}
      {/* ================= PRODUCTS ================= */}
      <section
        id="products"
        className="px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-2 border-b border-[#dce4dd] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#58705f]">
                Find your next pair
              </p>
              <h2 className="mt-2 text-3xl font-bold text-[#1c2520] sm:text-4xl">
                Shop footwear
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {filteredProducts.length} styles to explore
            </p>
          </div>

          <div className="relative mt-5 max-w-xl">
            <FiSearch
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#718075]"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search shoes, brands, categories..."
              aria-label="Search products"
              className="h-12 w-full rounded-md border border-[#d4ddd5] bg-white py-3 pl-11 pr-12 text-sm text-[#1c2520] outline-none transition placeholder:text-gray-400 focus:border-[#718a78] focus:ring-2 focus:ring-[#718a78]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear product search"
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <FiX aria-hidden="true" />
              </button>
            )}
          </div>

          {/* ================= BRANDS ================= */}
          <div
            id="brands"
            role="group"
            aria-label="Filter products by brand"
            tabIndex={0}
            className="mt-5 flex flex-nowrap gap-2 overflow-x-auto pb-3 [scrollbar-width:thin] sm:mt-6 sm:gap-3"
          >
            {brands.map((brand) => (
              <button
                type="button"
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:px-5 sm:text-sm ${
                  selectedBrand === brand
                    ? "bg-[#26382e] text-white"
                    : "border border-[#d4ddd5] bg-white/70 text-[#3f4d43] hover:border-[#8b9b8d] hover:bg-white"
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* ================= LOADING ================= */}
          {loading && (
            <p className="mt-10 text-center">
              Loading products...
            </p>
          )}

          {/* ================= ERROR ================= */}
          {error && (
            <p className="mt-10 text-center text-red-500">
              {error}
            </p>
          )}

          {/* ================= PRODUCT CARDS ================= */}
          {!loading && !error && (
            <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:gap-6 lg:grid-cols-4">

              {filteredProducts.length === 0 ? (
                <p className="col-span-full text-center text-gray-500">
                  No products found.
                </p>
              ) : (
                filteredProducts.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${product._id}`}
                      className="block min-w-0"
                    >
                      <div className="h-full overflow-hidden rounded-lg border border-[#e1e7e1] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

                        {/* Product Image */}
                        <div className="relative aspect-square w-full bg-[#edf1ed] p-2 sm:p-4">
                          {product.image ? (
                            <img
                              src={getProductImageUrl(product.image)}
                              alt={product.name}
                              className="h-full w-full object-contain transition-transform duration-300 hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                              Image unavailable
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex h-full min-w-0 flex-col p-3 sm:p-5">

                          <h3 className="line-clamp-2 min-h-10 break-words text-sm font-semibold leading-5 text-[#202923] sm:min-h-14 sm:text-lg sm:leading-7">
                            {product.name}
                          </h3>

                          <p className="mt-1 line-clamp-1 break-words text-xs font-medium text-[#718075] sm:text-sm">
                            {product.brand || "Shoe"}
                          </p>

                          <p className="mt-2 text-base font-bold text-[#26382e] sm:mt-3 sm:text-xl">
                            ₹{product.price}
                          </p>

                          <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-gray-600 sm:text-sm">
                            {product.description}
                          </p>

                        </div>

                      </div>
                    </Link>
                ))
              )}

            </div>
          )}

        </div>
      </section>

      {/* ================= CONTACT ================= */}
      <section
        id="contact"
        className="bg-surface-soft px-6 py-16"
      >
        <div className="mx-auto max-w-7xl text-center">

          <h2 className="text-3xl font-bold">
            Contact
          </h2>

          <p className="mt-4 text-gray-600">
            Get in touch with SHOELY.
          </p>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-gray-200 px-6 py-8">
        <div className="mx-auto max-w-7xl text-center">

          <p className="text-sm text-gray-500">
            © 2026 SHOELY. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}