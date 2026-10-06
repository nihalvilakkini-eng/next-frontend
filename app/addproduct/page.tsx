"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();

        const formData = new FormData();

        formData.append("name", name);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("description", description);

        if (image) {
            formData.append("image", image);
        }

        const response = await fetch("/api/products/add", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            alert("Product added successfully");
            router.push("/products/listing");
        } else {
            alert(data.message || "Failed to add product");
        }
    };

    return (
        <div>
            <h1>Add Product</h1>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Product name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Select Category</option>
                    <option value="Mobile Phones">Mobile Phones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Computer Accessories">
                        Computer Accessories
                    </option>
                    <option value="Home Appliances">
                        Home Appliances
                    </option>
                    <option value="Fashion">Fashion</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Watches">Watches</option>
                    <option value="Gaming">Gaming</option>
                </select>

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                        setImage(e.target.files?.[0] || null)
                    }
                />

                <button type="submit">
                    Add Product
                </button>

            </form>
        </div>
    );
}