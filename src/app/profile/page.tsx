"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, Calendar } from "lucide-react";
import { useCart } from "../wrappers/cartContext";
import Link from "next/link";

export default function ProfilePage() {
  const { user, setUser, setAddress, setShowRadiusNote, validRadius, setValidRadius } = useCart();
  const [editingName, setEditingName] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string | undefined>("");
  const [userComment, setUserComment] = useState<string | undefined>("");
  const [bellName, setBellName] = useState<string | undefined>("");
  const [defaultTime, setDefaultTime] = useState(0);
  const [warning, setWarning] = useState("");

  // 🧠 When user changes (loaded later), update the dependent states
  useEffect(() => {
    if (user) {
      setNameInput(user.name ?? "");
      setSelectedFloor(user.floor ?? "");
      setAddress(user.address ?? "");
      if (user.business) {
        //setValidRadius(user.validRadius ?? 0);
        setDefaultTime(user.defaultTime ?? 0);
      } else {
        setUserComment(user.comment ?? "");
        setBellName(user.bellName ?? "");
      }
    }
    if (user?.distanceToDestination && validRadius && user.distanceToDestination > validRadius) {
      setWarning("Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας.")
    }
  }, [user, setAddress, setValidRadius, validRadius]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);

    if (e.target.value.length < 3) {
      setResults([]); // clear results if query is empty
      return;
    }

    const res = await fetch(
      `/api/search-address?query=${encodeURIComponent(e.target.value)}`
    );
    const data = await res.json();
    setResults(data.suggestions || []);
  };

  const handleUpdate = async () => {
    try {
      const payload = { name: nameInput }

      // Then, update the user with the distance included
      const response = await fetch(`/api/user/${user?.id}/update-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
        }),
      });

      const updatedUser = await response.json();

      setUser(updatedUser);
      setEditingName(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      const addressToSend = query?.trim() || results[0]?.trim();

      if (!addressToSend || addressToSend.trim().length < 3 || !query) {
        setWarning("Παρακαλώ εισάγετε μια έγκυρη διεύθυνση.");
        return;
      }

      const payload = { address: addressToSend };
      const response = await fetch(`/api/user/${user?.id}/update-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // payload can include { address }
      });

      if (!response.ok) throw new Error("Failed to update user");

      const data = await response.json();
      
      setWarning("");
      setQuery("")
      setUser(data.updatedUser);
      setAddress(data.updatedUser.address)
      if (validRadius && data.distanceValue > validRadius) {
        setWarning("Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας.")
      } else {
        setWarning("Η διεύθυνσή σας αποθηκεύτηκε απιτυχώς");
        setEditingAddress(false); 
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-0 sm:pt-24 sm:pb-16">
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
                onClick={handleUpdate}
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
                    onClick={handleUpdateAddress}
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
                        setAddress(r);
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

            {warning && (
              <div className="text-red-600 font-semibold mt-4 mb-4">
                {warning}
              </div>
            )}

            {!user?.business && (
              <div className="flex flex-col gap-4">
                {/* Ενημέρωση ορόφου */}
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-gray-700">Επεξεργασία ορόφου:</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedFloor || ""}
                      onChange={(e) => setSelectedFloor(e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Επίλεξε όροφο</option>
                      <option value="Ισόγειο">Ισόγειο</option>
                      <option value="1ος">1ος όροφος</option>
                      <option value="2ος">2ος όροφος</option>
                      <option value="3ος">3ος όροφος</option>
                      <option value="4ος">4ος όροφος</option>
                      <option value="5ος">5ος όροφος</option>
                      <option value="6ος">6ος όροφος</option>
                      <option value="7ος">7ος όροφος</option>
                      <option value="8ος">8ος όροφος</option>
                      <option value="9ος">9ος όροφος</option>
                      <option value="10ος">10ος όροφος</option>
                    </select>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/user/${user?.id}/update-floor`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ floor: selectedFloor }), // no userEmail needed
                          });
                          if (!res.ok) throw new Error("Failed to update floor");
                          alert("Ο όροφος ενημερώθηκε επιτυχώς!");
                        } catch (err) {
                          console.error(err);
                          alert("Πρόβλημα κατά την ενημέρωση του ορόφου.");
                        }
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      Αποθήκευση
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-gray-700">Όνομα στο κουδούνι (προεραιτικό):</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bellName || ""}
                      onChange={(e) => setBellName(e.target.value)}
                      placeholder="Γράψε το όνομα που φαίνεται στο κουδούνι"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                    />
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/user/${user?.id}/update-bellName`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ bellName }), // no userEmail needed
                          });
                          if (!res.ok) throw new Error("Failed to update bell name");
                          alert("Το όνομα στο κουδούνι ενημερώθηκε επιτυχώς!");
                        } catch (err) {
                          console.error(err);
                          alert("Πρόβλημα κατά την ενημέρωση του ονόματος κουδουνιού.");
                        }
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      Αποθήκευση
                    </button>
                  </div>
                </div>

                {/* Προαιρετικό σχόλιο */}
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-gray-700">Σχόλιο για να διευκολυνθεί η εύρεση της κατοικίας σου (προεραιτικό):</p>
                  <div className="flex flex-col items-center gap-2">
                    <textarea
                      value={userComment || ""}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Γράψε ό,τι θέλεις για να διευκολυνθεί να βρεθεί η τοποθεσία σου"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                      rows={4}
                    />
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/user/${user?.id}/update-comment`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ comment: userComment }), // no userEmail needed
                          });
                          if (!res.ok) throw new Error("Failed to update comment");
                          alert("Το σχόλιο ενημερώθηκε επιτυχώς!");
                        } catch (err) {
                          console.error(err);
                          alert("Πρόβλημα κατά την ενημέρωση του σχολίου.");
                        }
                      }}
                      className="bg-green-500 w-full text-white px-3 py-2 rounded-lg hover:bg-green-600 transition"
                    >
                      Αποθήκευση Σχολίου
                    </button>
                  </div>
                </div>
              </div>
            )}

            {user?.business && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-gray-700">Μέσος χρόνος προετοιμασίας (αυτός ο χρόνος προστίθεται στον χρόνο που χρειάζεται ο ντελιβεράς):</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={defaultTime || ""}
                      onChange={(e) => setDefaultTime(Number(e.target.value))}
                      className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-yellow-400"
                    >
                      <option value="">Επίλεξε χρόνο</option>
                      {Array.from({ length: 29 }, (_, i) => (i + 1) * 5).map((time) => (
                        <option key={time} value={time}>
                          {time} λεπτά
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/update-defaultTime", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ defaultTime }),
                          });
                          if (!res.ok) throw new Error("Failed to update default time");
                          alert("Ο προεπιλεγμένος χρόνος ενημερώθηκε επιτυχώς!");
                        } catch (err) {
                          console.error(err);
                          alert("Πρόβλημα κατά την ενημέρωση του προεπιλεγμένου χρόνου.");
                        }
                      }}
                      className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                      Αποθήκευση
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-col items-center gap-3 sm:gap-4">
                  <span className="text-gray-700">
                    Ορίστε την μέγιστη δυνατή απόσταση όπου γίνεται delivery σε (km):
                  </span>
                  <div className="flex flex-row gap-4 w-full">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={validRadius ?? 0}
                      onChange={(e) => setValidRadius(parseFloat(e.target.value || "0"))}
                      placeholder="Ορίστε απόσταση"
                      className={`border p-2 rounded-lg w-full text-center ${
                        !validRadius ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      onClick={async () => {
                        if (!validRadius) {
                          alert("Παρακαλώ εισάγετε μια τιμή.");
                          return;
                        }

                        const radiusValue = validRadius;
                        if (isNaN(radiusValue) || radiusValue <= 0) {
                          alert("Η απόσταση πρέπει να είναι μεγαλύτερη από 0 km.");
                          return;
                        }
                        try {
                          const res = await fetch(`/api/user/${user.id}/update-valid-radius`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              validRadius: validRadius, // no userId needed here
                            }),
                          });

                          if (!res.ok) throw new Error("Failed to update radius");

                          const data = await res.json(); 
                          alert(`Μέγιστη έγκυρη απόσταση: ${data.validRadius} km`);
                          setShowRadiusNote(false);
                        } catch (err) {
                          console.error(err);
                          alert("Something went wrong");
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                      Αποθήκευση
                    </button>
                  </div>
                </div>
                <Link
                  href="/schedule-manage"
                  title="Επεξεργασία ωρών λειτουργίας του καταστήματος"
                  className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4"
                >
                  Επεξεργασία ωρών λειτουργίας
                  <Calendar className="w-5 h-5 ml-2" />
                </Link>
              </div>
            )}
        </div>
    </div>
    </>
  );
}
