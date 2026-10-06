"use client";

import { useEffect, useState } from "react";
import { SHOE_BRANDS } from "@/lib/brands";

export default function AdminDashboard() {
  type Product = {
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
    category: string;
    brand: string;
  };
  const [editLoading, setEditLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(data.message);
        return;
      }

      setProducts(data.products || []);
    } catch (error) {
      console.error("Get products error:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleAddProduct = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!image) {
      setMessage("Please select an image");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("brand", brand);
      formData.append("category", category);
      formData.append("description", description);
      formData.append("image", image);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add product");
        return;
      }

      setMessage("Product added successfully!");
      getProducts();

      setName("");
      setPrice("");
      setBrand("");
      setCategory("");
      setDescription("");
      setImage(null);

      const fileInput = document.getElementById(
        "productImage"
      ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);

    setName(product.name);
    setPrice(String(product.price));
    setBrand(product.brand);
    setCategory(product.category);
    setDescription(product.description);

    // Existing image is NOT put into File state.
    // User can optionally select a new image.
    setImage(null);

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  //edit
  const handleEditProduct = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!editingProduct) return;

    try {
      setEditLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("name", name);
      formData.append("price", price);
      formData.append("brand", brand);
      formData.append("category", category);
      formData.append("description", description);

      // New image selected only if user wants to change it
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch(
        `/api/admin/products/update/${editingProduct._id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update product");
        return;
      }

      setMessage("Product updated successfully!");

      // Exit edit mode
      setEditingProduct(null);

      // Clear form
      setName("");
      setPrice("");
      setBrand("");
      setCategory("");
      setDescription("");
      setImage(null);

      const fileInput = document.getElementById(
        "productImage"
      ) as HTMLInputElement;

      if (fileInput) {
        fileInput.value = "";
      }

      // Refresh products
      getProducts();

    } catch (error) {
      console.error("Edit product error:", error);
      setMessage("Something went wrong");
    } finally {
      setEditLoading(false);
    }
  };
  //delete 
  const handleDeleteProduct = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      setDeleteLoading(id);

      const response = await fetch(
        `/api/admin/products/delete/${id}`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete product");
        return;
      }

      alert("Product deleted successfully!");

      getProducts();
    } catch (error) {
      console.error("Delete product error:", error);
      alert("Something went wrong");
    } finally {
      setDeleteLoading(null);
    }
  };
  return (
    <main className="min-h-screen bg-background">

      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <div>
            <h1 className="text-2xl font-bold">
              SHOELY
            </h1>

            <p className="text-sm text-gray-500">
              Admin Dashboard
            </p>
          </div>

          <a
            href="/"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-black hover:text-white"
          >
            Back to Home
          </a>

        </div>
      </header>


      {/* ADD PRODUCT */}

      <section className="mx-auto max-w-4xl px-6 py-12">

        <div className="mb-8">

          <p className="text-sm uppercase tracking-widest text-gray-500">
            Admin
          </p>

          <h2 className="mt-2 text-4xl font-bold">
            {editingProduct ? "Edit Product" : "Add Product"}
          </h2>

          <p className="mt-2 text-gray-500">
            {editingProduct
              ? "Update the product details."
              : "Add a new shoe product to your store."}
          </p>

        </div>


        {/* FORM */}

        <div className="rounded-3xl bg-white p-8 shadow">

          <form
            onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
            className="space-y-6"
          >

            {/* NAME */}

            <div>

              <label className="mb-2 block font-medium">
                Product Name
              </label>

              <input
                type="text"
                placeholder="Example: Nike Air Max"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            {/* PRICE */}

            <div>

              <label className="mb-2 block font-medium">
                Price
              </label>

              <input
                type="number"
                placeholder="Example: 4999"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                required
                min="0"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            {/* BRAND */}

            <div>

              <label className="mb-2 block font-medium">
                Brand
              </label>

              <select
                value={brand}
                onChange={(e) =>
                  setBrand(e.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-black"
              >

                <option value="">
                  Select Brand
                </option>

                {SHOE_BRANDS.map((shoeBrand) => (
                  <option key={shoeBrand} value={shoeBrand}>
                    {shoeBrand}
                  </option>
                ))}

              </select>

            </div>


            {/* CATEGORY */}

            <div>

              <label className="mb-2 block font-medium">
                Category
              </label>

              <input
                type="text"
                placeholder="Example: Sneakers"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            {/* DESCRIPTION */}

            <div>

              <label className="mb-2 block font-medium">
                Description
              </label>

              <textarea
                placeholder="Enter product description"
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                required
                rows={5}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            {/* IMAGE */}

            <div>

              <label className="mb-2 block font-medium">
                Product Image
              </label>

              <input
                id="productImage"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImage(e.target.files?.[0] || null)
                }
                required={!editingProduct}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              />

            </div>


            {/* MESSAGE */}

            {message && (
              <div className="rounded-xl bg-gray-100 p-4 text-center">

                <p className="font-medium">
                  {message}
                </p>

              </div>
            )}


            {/* BUTTON */}

            <button
              type="submit"
              disabled={editingProduct ? editLoading : loading}
              className="w-full rounded-xl bg-black py-4 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {editingProduct
                ? editLoading
                  ? "Updating Product..."
                  : "Update Product"
                : loading
                  ? "Adding Product..."
                  : "Add Product"}
            </button>

          </form>

        </div>

      </section>
      <div className="mt-10 rounded-3xl bg-white p-8 shadow">

        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            Products
          </h2>

          <p className="text-sm text-gray-500">
            Products added to your store
          </p>
        </div>

        {productsLoading ? (
          <p className="py-8 text-center text-gray-500">
            Loading products...
          </p>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No products found.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b text-left text-sm text-gray-500">

                  <th className="px-4 py-4">
                    Image
                  </th>

                  <th className="px-4 py-4">
                    Product
                  </th>

                  <th className="px-4 py-4">
                    Brand
                  </th>

                  <th className="px-4 py-4">
                    Category
                  </th>

                  <th className="px-4 py-4">
                    Price
                  </th>

                  <th className="px-4 py-4">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="border-b"
                  >

                    <td className="px-4 py-4">

                      <img
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${product.image}`}
                        alt={product.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />

                    </td>

                    <td className="px-4 py-4 font-medium">
                      {product.name}
                    </td>

                    <td className="px-4 py-4">
                      {product.brand}
                    </td>

                    <td className="px-4 py-4">
                      {product.category}
                    </td>

                    <td className="px-4 py-4 font-semibold">
                      ₹{product.price}
                    </td>

                    <td className="px-4 py-4">

                      <div className="flex gap-2">

                        <button
                          type="button"
                          onClick={() => startEditing(product)}
                          className="rounded-lg border px-3 py-2 text-sm hover:bg-black hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deleteLoading === product._id}
                          className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white disabled:opacity-50"
                        >
                          {deleteLoading === product._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>
    </main>
  );
}