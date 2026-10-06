"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Product = {
  _id: string;
  name: string;
  price: number;
  brand?: string;
  category: string;
  description: string;
  image?: string;
};

export default function ProductDetails() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/products/${id}`,
          { cache: "no-store" }
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Product not found");
        }

        setProduct(data.data || data.product || data);
      } catch (error) {
        console.error("Product details error:", error);
        setError("Unable to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      getProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error || "Product not found"}</p>
        <Link href="/" className="rounded-lg bg-black px-5 py-2 text-white">
          Back to Home
        </Link>
      </main>
    );
  }

  const imageUrl = product.image
    ? /^https?:\/\//i.test(product.image)
      ? product.image
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/${product.image
          .replace(/\\/g, "/")
          .replace(/^\/+/, "")}`
    : "";

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4c6253] transition hover:text-[#1c2520] sm:mb-7">
          <span aria-hidden="true">←</span> Continue shopping
        </Link>

        <div className="overflow-hidden rounded-xl border border-[#e1e7e1] bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[1.08fr_0.92fr]">
            <div className="flex aspect-square min-h-0 items-center justify-center bg-[#edf1ed] p-5 sm:p-8 md:aspect-auto md:min-h-[520px]">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="max-h-[520px] w-full object-contain" />
              ) : (
                <p className="text-gray-500">No image available</p>
              )}
            </div>

            <div className="flex flex-col p-5 sm:p-8 md:justify-center md:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#718075]">
                {product.category}
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-[#1c2520] sm:text-4xl">
                {product.name}
              </h1>

              {product.brand && (
                <p className="mt-3 text-sm font-medium text-gray-500">
                  By <span className="text-[#34473d]">{product.brand}</span>
                </p>
              )}

              <p className="mt-6 border-y border-[#e8ede8] py-4 text-3xl font-bold text-[#34473d]">
                ₹{product.price}
              </p>

              <div className="mt-5">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                  Product details
                </h2>
                <p className="mt-2 leading-7 text-gray-600">
                  {product.description}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="min-h-12 rounded-md bg-[#26382e] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1b2a21]"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="min-h-12 rounded-md border border-[#34473d] px-5 py-3 text-sm font-semibold text-[#26382e] transition hover:bg-[#edf1ed]"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}