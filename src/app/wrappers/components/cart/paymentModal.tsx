// PaymentModal.tsx
import { FC } from "react";
import { ArrowLeft, Edit2, Check, X, ChevronUp, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "../../cartContext";
import {
  handleSearch,
  handleUpdateAddress,
  handleUpdateAll,
} from "../../functions/cart";

interface PaymentModalProps {
  showPaymentModal: boolean;
  setShowPaymentModal: (val: boolean) => void;
  setFormLoaded: (val: boolean) => void;
  query: string;
  setQuery: (val: string) => void;
  results: string[];
  setResults: (val: string[]) => void;
  editingAddress: boolean;
  setEditingAddress: (val: boolean) => void;
  validRadius: number | null;
  showDetails: boolean;
  setShowDetails: (val: boolean) => void;
  setWarning: (val: string) => void;
  bellName?: string;
  setBellName: (val: string) => void;
  userComment: string | undefined;
  setUserComment: (val: string | undefined) => void;
  total: number;
  isTooFar: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  setPaymentWayModal: (val: boolean) => void;
}

const PaymentModal: FC<PaymentModalProps> = ({
  showPaymentModal,
  setShowPaymentModal,
  setFormLoaded,
  query,
  setQuery,
  results,
  setResults,
  editingAddress,
  setEditingAddress,
  validRadius,
  showDetails,
  setShowDetails,
  setWarning,
  bellName,
  setBellName,
  userComment,
  setUserComment,
  total,
  isTooFar,
  setIsSidebarOpen,
  setPaymentWayModal,
}) => {
  const { user, setUser, address, setAddress, selectedFloor, setSelectedFloor } = useCart();
  const router = useRouter();
  if (!showPaymentModal) return null;

  return (
    <div className="fixed mb-12 sm:mb-0 inset-0 bg-opacity-50 z-60 flex justify-center items-center h-full">
      <div className="bg-gray-100 w-full h-full max-h-full flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center border-b border-gray-400 pb-4">
          <button
            onClick={() => {
              setShowPaymentModal(false);
              setFormLoaded(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 ml-1">Επιβεβαίωση πληρωμής</h2>
        </div>

        {/* Address & Details */}
        {user?.address && (
          <div
            className="text-gray-700 text-sm flex flex-col pt-6 px-2 overflow-x-hidden overflow-y-auto"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#a8a8a8ff #e5e7eb",
            }}
          >
            <span>
              <span className="font-semibold text-gray-800">{user.address}</span> 
            </span>

            {editingAddress ? (
              <div className="mt-4 relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e, setQuery, setResults)}
                    placeholder="Type your address..."
                    className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() =>
                      handleUpdateAddress(
                        user,
                        address,
                        query,
                        results,
                        setUser,
                        setAddress,
                        setWarning,
                        setEditingAddress,
                        validRadius
                      )
                    }
                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setEditingAddress(!editingAddress)}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

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
              <div
                onClick={() => {setEditingAddress(true); setShowDetails(true)}}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium shadow-sm hover:bg-gray-300 hover:shadow-md transition-all hover:scale-105"
              >
                <Edit2 size={18} />
                <span>Αλλαγή Διεύθυνσης</span>
              </div>
            )}

            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 justify-center w-full p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 mt-4"
            >
              {showDetails ? "Απόκρυψη λεπτομερειών" : "Εμφάνιση λεπτομερειών"}
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showDetails && (
              <div className="flex flex-col gap-2">

                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-gray-700">Όροφος:</p>
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
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-gray-700">Όνομα στο κουδούνι (προεραιτικό):</p>
                  <input
                    type="text"
                    value={bellName || ""}
                    onChange={(e) => setBellName(e.target.value)}
                    placeholder="Γράψε το όνομα που φαίνεται στο κουδούνι"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-gray-700">
                    Σχόλιο για να διευκολυνθεί η εύρεση της κατοικίας σου (προεραιτικό):
                  </p>
                  <textarea
                    value={userComment || ""}
                    onChange={(e) => setUserComment(e.target.value)}
                    placeholder="Γράψε ό,τι θέλεις για να διευκολυνθεί να βρεθεί η τοποθεσία σου"
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-yellow-400"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-gray-300 mt-auto">
          <p className="mt-4 px-1 font-bold text-gray-900 text-2xl">Σύνολο: {total.toFixed(2)}€</p>
          <button
            className="mt-2 w-full bg-yellow-400 text-gray-800 py-3 sm:py-2 text-lg sm:text-xl rounded-xl font-semibold hover:bg-yellow-500 transition"
            onClick={() => {
              if (!user) {
                setIsSidebarOpen(false);
                router.push("/auth/signin");
                return;
              }

              if (!selectedFloor) {
                setShowDetails(true);
                setWarning("Παρακαλώ επίλεξε όροφο πριν την πληρωμή.");
                return;
              }

              if (!user?.address) {
                setWarning("Παρακαλώ επίλεξε διεύθυνση πριν την πληρωμή.");
                return;
              }

              if (isTooFar) {
                setWarning(
                  "Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας."
                );
                return;
              }

              setWarning("");
              const floorChanged = user.floor !== selectedFloor;
              const bellChanged = user.bellName !== bellName;
              const commentChanged = user.comment !== userComment;

              if (floorChanged || bellChanged || commentChanged) {
                handleUpdateAll(user, selectedFloor, bellName, userComment, setUser);
              }

              setPaymentWayModal(true);
            }}
          >
            Επιβεβαίωση Πληρωμής
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
