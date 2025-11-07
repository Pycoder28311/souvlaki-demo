"use client";

import { X, Pencil } from "lucide-react";
import React from "react";
import { useCart } from "../wrappers/cartContext";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function AddressModal() {
  const { showWelcome, setShowWelcome, address, user, setUser, setAddress, validRadius } = useCart(); 
  const [warning, setWarning] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [editingAddress, setEditingAddress] = useState(false);
  
  const [selectedFloor, setSelectedFloor] = useState<string | undefined>(user?.floor);
  const [userComment, setUserComment] = useState<string | undefined>(user?.comment);
  const [bellName, setBellName] = useState<string | undefined>(user?.bellName);
  const [showExtraInfo, setShowExtraInfo] = useState(false);

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

  const handleUpdateAddress = async () => {
    try {
      
      const addressToSend = results[0]?.trim() ? results[0] : address;

      if (!addressToSend || addressToSend.trim().length < 3 || !query) {
        setWarning("Παρακαλώ εισάγετε μια έγκυρη διεύθυνση.");
        return;
      }

      const payload = { address: addressToSend };
      const response = await fetch(`/api/user/${user?.id}/update-address`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const data = await response.json();
      
      //setEditingAddress(false);
      setWarning("");
      setQuery("")
      setUser(data.updatedUser);
      setAddress(data.updatedUser.address)
      if (validRadius && data.distanceValue > validRadius) {
        setWarning("Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας.")
      } else {
        setWarning("Η διεύθυνσή σας αποθηκεύτηκε απιτυχώς");
        setEditingAddress(false); 
        setTimeout(() => {
          setWarning("");
          setShowWelcome(false)  
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleConfirmAddress = () => {
    setWarning("")
    //setEditingAddress(false); 
  };
  
  if (!showWelcome || !user || user?.business) return null;

  return(
    <>
      {showWelcome && user && (
        <div className="block md:fixed md:top-20 md:left-0 bg-transparent md:bg-gray-100 border-0 md:border md:border-gray-200 shadow-none md:shadow p-0 md:p-3 z-50 w-auto max-w-full md:rounded-r-xl">
          {editingAddress ? (
            <div className="absolute w-screen left-1/2 transform -translate-x-1/2 md:translate-x-0 md:w-auto top-10 md:top-0 p-4 md:p-0 bg-white md:static md:bg-transparent">
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="hidden md:flex justify-between items-end w-full">
                  <p className="text-gray-700">Διεύθυνση:</p>
                  <button
                    onClick={() => setEditingAddress(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                  >
                    <X className="w-5 h-6" />
                  </button>
                </div>
                <div className="flex w-full gap-4">
                  <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Πληκτρολογήστε τη διεύθυνσή σας..."
                    className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => {setAddress(query); handleConfirmAddress(); handleUpdateAddress();}}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center"
                  >
                    <span className="hidden sm:block">Αποθήκευση</span>

                    {/* Icon σε μικρές οθόνες */}
                    <Pencil className="w-5 h-6 sm:hidden" />
                  </button>
                </div>
              </div>

              {/* Dropdown Results */}
              {results.length > 0 && (
                <ul className="absolute left-4 bg-white border rounded-xl max-h-52 overflow-y-auto mt-1 shadow-lg z-20">
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
              
              <div className="hidden md:flex flex-col gap-4">
                {/* Ενημέρωση ορόφου */}
                <div className="flex flex-col gap-2 mt-4">
                <p className="text-gray-700">Όροφος:</p>
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
                          const res = await fetch(`/api/user/${user.id}/update-floor`, {
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

                <div className="flex flex-col gap-2">
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
                          const res = await fetch(`/api/user/${user.id}/update-bellName`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ bellName }),
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
                <div className="flex flex-col gap-2">
                  <p className="text-gray-700">Σχόλιο για να διευκολυνθεί η εύρεση της κατοικίας σου (προεραιτικό):</p>
                  <div className="flex flex-col items-center gap-2">
                    <textarea
                      value={userComment || ""}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Γράψε ό,τι θέλεις για να διευκολυνθεί να βρεθεί η τοποθεσία σου"
                      className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                      rows={2}
                    />
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/user/${user.id}/update-comment`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ comment: userComment }), // userEmail no longer needed
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 max-w-full">
              {/* Desktop version */}
              <strong className="text-gray-500 text-lg truncate hidden md:block">
                {user.business
                  ? "Είναι αυτή η διεύθυνσή της επιχείρησης;"
                  : "Είναι αυτή η διεύθυνσή σας;"}
              </strong>
              <p className="text-gray-500 text-lg truncate hidden md:block">
                {user?.address}
              </p>

              <button
                onClick={() => setShowExtraInfo(!showExtraInfo)}
                className="text-blue-500 hover:underline hidden md:block"
              >
              {showExtraInfo
                  ? "Απόκρυψη πρόσθετων πληροφοριών"
                  : "Έλεγχος περισσότερων στοιχείων"}
              </button>

              {/* Extra info section */}
              {showExtraInfo && (
                <div className="w-full flex flex-col gap-2">
                  <p>
                    <strong>Όροφος:</strong>{" "}
                    {user?.floor ? (
                      <span className="text-gray-800">{user.floor}</span>
                    ) : (
                      <span className="text-gray-400">Δεν έχει οριστεί</span>
                    )}
                  </p>

                  <p>
                    <strong>Όνομα κουδουνιού:</strong>{" "}
                    {user?.bellName ? (
                      <span className="text-gray-800">{user.bellName}</span>
                    ) : (
                      <span className="text-gray-400">Δεν έχει οριστεί</span>
                    )}
                  </p>

                  <p>
                    <strong>Σχόλιο:</strong>{" "}
                    {user?.comment ? (
                      <span className="text-gray-800">{user.comment}</span>
                    ) : (
                      <span className="text-gray-400">Δεν έχει δοθεί σχόλιο</span>
                    )}
                  </p>
                </div>
              )}
              <div className="flex-row items-center gap-4 w-full justify-between hidden md:flex">
                  <button
                      onClick={() => {
                      handleConfirmAddress();
                      setShowWelcome(false);
                      }}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                      Ναι, απόκρυψη
                  </button>
                  <button
                      onClick={() => setEditingAddress(true)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex-shrink-0"
                  >
                      Όχι, επεξεργασία
                  </button>
                  </div>
            </div>
          )}

          {/* Mobile version */}
          <div className="text-gray-500 text-lg truncate md:hidden flex flex-col">
              <div
              className="flex items-center justify-between cursor-pointe underline"
              onClick={() => setEditingAddress(!editingAddress)}
              >
              <strong>{user?.address ? user.address.split(",")[0] : "—"}</strong>
              {editingAddress ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
              </div>
          </div>

          {warning && (
            <div className="hidden md:flex-wrap max-w-80 text-red-600 font-semibold mt-2 mb-2 items-center">
              {warning}
            </div>
          )}
        </div>
      )}
    </>
  )
}