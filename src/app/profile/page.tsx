"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  business: boolean;
  address: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User>();
  const [editingName, setEditingName] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);

    if (e.target.value.length < 3) return; // only search after 3 chars

    const res = await fetch(
      `/api/search-address?query=${encodeURIComponent(e.target.value)}`
    );
    const data = await res.json();
    setResults(data.suggestions || []);
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
          setNameInput(session.user.name);
          setSelected("");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  const handleUpdate = async (field: "name" | "address") => {
    try {
      const payload =
        field === "name"
          ? { name: nameInput }
          : { address: selected };

      const response = await fetch("/api/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to update user");

      const updatedUser = await response.json();
      setUser(updatedUser);

      if (field === "name") setEditingName(false);
      else setEditingAddress(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-0">
        <div
            className="
            bg-white shadow-xl w-full text-center relative 
            rounded-none min-h-screen 
            pt-24 p-6
            sm:rounded-3xl sm:max-w-md sm:min-h-0 sm:p-8 sm:pt-8
            "
        >
            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-6">
            <button className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 shadow-inner focus:outline-none">
                <span className="w-full h-full flex items-center justify-center bg-gray-300 text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
            </button>
            </div>

            {/* Name */}
            {editingName ? (
            <div className="mb-4 flex items-center justify-center gap-2">
                <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="border border-gray-300 rounded-xl p-3 w-auto text-center focus:ring-2 focus:ring-blue-400"
                />
                <button
                onClick={() => handleUpdate("name")}
                className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                >
                <Check className="w-5 h-5" />
                </button>
                <button
                onClick={() => setEditingName(false)}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                >
                <X className="w-5 h-5" />
                </button>
            </div>
            ) : (
            <h1 className="text-3xl font-semibold mb-3 flex items-center justify-center gap-2">
                {user?.name}
                <button
                onClick={() => setEditingName(true)}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                >
                <Pencil className="w-5 h-5" />
                </button>
            </h1>
            )}

            {/* Address */}
            {editingAddress ? (
            <div className="mb-4 relative">
                <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Type your address..."
                    className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400"
                />
                <button
                    onClick={() => handleUpdate("address")}
                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                >
                    <Check className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setEditingAddress(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                >
                    <X className="w-5 h-5" />
                </button>
                </div>

                {/* Dropdown Results */}
                {results.length > 0 && (
                <ul className="absolute top-full left-0 w-full bg-white border rounded-xl max-h-52 overflow-y-auto mt-1 shadow-lg z-20">
                    {results.map((r, i) => (
                    <li
                        key={i}
                        onClick={() => {
                        setSelected(r);
                        setQuery(r);
                        setResults([]);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-left"
                    >
                        {r}
                    </li>
                    ))}
                </ul>
                )}

                {selected && <p className="mt-2 text-gray-700">Selected: {selected}</p>}
            </div>
            ) : (
            <div className="flex items-center justify-center gap-2 max-w-full mb-4">
                <p className="text-gray-500 text-lg truncate">{user?.address}</p>
                <button
                onClick={() => setEditingAddress(true)}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex-shrink-0"
                >
                <Pencil className="w-5 h-5" />
                </button>
            </div>
            )}
        </div>
    </div>
    </>

  );
}
