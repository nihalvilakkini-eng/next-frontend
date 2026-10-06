
"use client";

import { useEffect, useState } from "react";
import { getBackendAssetUrl } from "@/lib/backend-assets";

type User = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  profileImage?: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  // ================= GET PROFILE =================
  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load profile");
        }

        const profile = data.data;

        setUser(profile);

        setFirstName(profile.firstName || "");
        setLastName(profile.lastName || "");
        setPhone(profile.phone || "");
      } catch (error) {
        console.error("Profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const formData = new FormData();

      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phone", phone);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Profile update failed");
        return;
      }

      const updatedUser = data.data;

      setUser(updatedUser);

      setFirstName(updatedUser.firstName || "");
      setLastName(updatedUser.lastName || "");
      setPhone(updatedUser.phone || "");

      setProfileImage(null);
      setEditing(false);

      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Unable to load profile.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-12">

      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md">

        {/* TITLE */}
        <h1 className="mb-8 text-center text-3xl font-bold">
          My Profile
        </h1>

        {/* PROFILE IMAGE */}
        <div className="mb-8 flex flex-col items-center">

          {user.profileImage ? (
            <img
              src={getBackendAssetUrl(user.profileImage)}
              alt="Profile"
              className="h-32 w-32 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gray-200 text-5xl">
              👤
            </div>
          )}

          {/* IMAGE SELECT */}
          {editing && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setProfileImage(e.target.files?.[0] || null)
              }
              className="mt-4 text-sm"
            />
          )}
        </div>

        {/* FIRST NAME */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            First Name
          </label>

          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            readOnly={!editing}
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              editing
                ? "border-gray-300 focus:border-black"
                : "border-gray-300 bg-gray-100"
            }`}
          />
        </div>

        {/* LAST NAME */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            Last Name
          </label>

          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            readOnly={!editing}
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              editing
                ? "border-gray-300 focus:border-black"
                : "border-gray-300 bg-gray-100"
            }`}
          />
        </div>

        {/* EMAIL - NOT EDITABLE */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            Email
          </label>

          <input
            value={user.email || ""}
            readOnly
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3"
          />
        </div>

        {/* PHONE */}
        <div className="mb-5">
          <label className="mb-2 block font-medium">
            Phone
          </label>

          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            readOnly={!editing}
            className={`w-full rounded-lg border px-4 py-3 outline-none ${
              editing
                ? "border-gray-300 focus:border-black"
                : "border-gray-300 bg-gray-100"
            }`}
          />
        </div>

        {/* ROLE - NOT EDITABLE */}
        <div className="mb-6">
          <label className="mb-2 block font-medium">
            Role
          </label>

          <input
            value={user.role || ""}
            readOnly
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 capitalize"
          />
        </div>

        {/* MESSAGE */}
        {message && (
          <p className="mb-5 text-center text-sm font-medium">
            {message}
          </p>
        )}

        {/* BUTTONS */}
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMessage("");
            }}
            className="w-full rounded-lg bg-black py-3 font-semibold text-white hover:bg-gray-800"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-4">

            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setProfileImage(null);

                setFirstName(user.firstName || "");
                setLastName(user.lastName || "");
                setPhone(user.phone || "");

                setMessage("");
              }}
              className="w-1/2 rounded-lg border border-gray-300 py-3 font-semibold hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-1/2 rounded-lg bg-black py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

          </div>
        )}

        {/* BACK HOME */}
        <button
          type="button"
          onClick={() => (window.location.href = "/")}
          className="mt-4 w-full rounded-lg border border-gray-300 py-3 font-semibold hover:bg-gray-100"
        >
          Back to Home
        </button>

      </div>

    </main>
  );
}

