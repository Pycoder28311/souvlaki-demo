import { X } from "lucide-react";

export default function FiltersSidebar({
  selectedProduct,
  setSelectedProduct,
  allProducts,
  selectedAddress,
  setSelectedAddress,
  allAddresses,
  selectedPaidIn,
  setSelectedPaidIn,
  allPaidInValues,
  selectedStatus,
  setSelectedStatus,
  allStatuses,
  selectedDate,
  setSelectedDate,
  sortOption,
  setSortOption,
  resetFilters,
  setIsOpen,
}) {

  return (
    <>

      {/* Sidebar */}
      <div
        className={`
          h-full bg-white shadow-r-lg p-6 w-full
          transform transition-transform duration-300 ease-in-out md:static md:shadow-none md:w-80
          z-50
        `}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Φίλτρα</h2>

          {/* X icon για κλείσιμο σε mobile */}
          <button
            className="md:hidden p-1 rounded hover:bg-gray-200"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Product */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Προϊόν:
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Όλα τα προϊόντα</option>
              {allProducts.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Διεύθυνση:
            </label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Όλες οι διευθύνσεις</option>
              {allAddresses.map((address) => (
                <option key={address} value={address}>
                  {address}
                </option>
              ))}
            </select>
          </div>

          {/* PaidIn */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Τρόπος πληρωμής:
            </label>
            <select
              value={selectedPaidIn}
              onChange={(e) => setSelectedPaidIn(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Όλοι οι τρόποι</option>
              {allPaidInValues.map((val) => (
                <option key={val} value={val}>
                  {val === "door" ? "Μετρητά" : val}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Κατάσταση:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="">Όλες οι καταστάσεις</option>
              {allStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Ημερομηνία:
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-full"
              />
              <button
                onClick={() => setSelectedDate("")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg"
              >
                Όλες
              </button>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Ταξινόμηση:
            </label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full"
            >
              <option value="newest">Νεότερες → Παλαιότερες</option>
              <option value="oldest">Παλαιότερες → Νεότερες</option>
              <option value="highest">Μεγαλύτερη πληρωμή → Μικρότερη</option>
              <option value="lowest">Μικρότερη πληρωμή → Μεγαλύτερη</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="mt-4 mb-4">
            <button
              onClick={resetFilters}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg w-full"
            >
              Καθαρισμός φίλτρων
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
