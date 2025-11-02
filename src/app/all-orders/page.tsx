"use client";

import { useEffect, useState, useMemo } from "react";
import { Order } from "../types"; 
import { useCart } from "../wrappers/cartContext";
import FiltersSidebar from "./filter";
import { ChevronDown } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useCart();
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPaidIn, setSelectedPaidIn] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {

    const evtSource = new EventSource("/api/read-all-orders");

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders(data);
      setLoading(false);
    };

    evtSource.onerror = () => {
      setLoading(false);
      evtSource.close();
    };

    return () => {
      evtSource.close();
    };
  }, [user]);

  const allProducts = useMemo(() => {
    const productSet = new Set<string>();
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (item.product?.name) productSet.add(item.product.name);
      });
    });
    return Array.from(productSet);
  }, [orders]);

  const allAddresses = useMemo(() => {
    const addressSet = new Set<string>();
    orders.forEach((order) => {
      if (order.user?.address) addressSet.add(order.user.address);
    });
    return Array.from(addressSet);
  }, [orders]);

  const allPaidInValues = useMemo(() => {
    const paidSet = new Set<string>();
    orders.forEach((order) => {
      if (order.paidIn) paidSet.add(order.paidIn);
    });
    return Array.from(paidSet);
  }, [orders]);

  const allStatuses = useMemo(() => {
    const statusSet = new Set<string>();
    orders.forEach((order) => {
      if (order.status) statusSet.add(order.status);
    });
    return Array.from(statusSet);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesProduct =
        !selectedProduct ||
        order.items?.some(
          (item) => item.product?.name === selectedProduct
        );
      const matchesAddress =
        !selectedAddress || order.user?.address === selectedAddress;
      const matchesPaidIn =
        !selectedPaidIn || order.paidIn === selectedPaidIn;
      const matchesStatus =
        !selectedStatus || order.status === selectedStatus;
      const matchesDate =
        !selectedDate ||
        new Date(order.createdAt).toISOString().slice(0, 10) === selectedDate;

      return (
        matchesProduct &&
        matchesAddress &&
        matchesPaidIn &&
        matchesStatus &&
        matchesDate
      );
    });

    // 🔹 Sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "highest":
          return (b.total || 0) - (a.total || 0);
        case "lowest":
          return (a.total|| 0) - (b.total || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    orders,
    selectedProduct,
    selectedAddress,
    selectedPaidIn,
    selectedStatus,
    selectedDate,
    sortOption,
  ]);

  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-gray-700 text-lg font-semibold">
          Φόρτωση παραγγελιών...
        </span>
      </div>
    );
  }

  if (!user?.business) return null;

  if (orders.length === 0)
  return (
    <div className="flex items-center justify-center h-screen">
      <span className="text-gray-700 text-lg font-semibold">
        Δεν υπάρχουν ακόμα παραγγελίες
      </span>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 pt-14 bg-gray-100">
      {/* Sidebar */}
      <div
        className={`absolute md:static md:w-80 w-full h-full shadow-r-lg z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:shadow-none md:bg-white border-t`}
        style={{ height: 'calc(100vh - 3.5rem)', overflowX: "hidden" }}
      >
        {/* Scrollable content */}
        <div className="h-full overflow-y-auto overflow-x-hidden bg-white">
          <FiltersSidebar
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            allProducts={allProducts}
            selectedAddress={selectedAddress}
            setSelectedAddress={setSelectedAddress}
            allAddresses={allAddresses}
            selectedPaidIn={selectedPaidIn}
            setSelectedPaidIn={setSelectedPaidIn}
            allPaidInValues={allPaidInValues}
            selectedStatus={selectedStatus}
            setSelectedStatus={setSelectedStatus}
            allStatuses={allStatuses}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            sortOption={sortOption}
            setSortOption={setSortOption}
            resetFilters={() => {
              setSelectedProduct("");
              setSelectedAddress("");
              setSelectedPaidIn("");
              setSelectedStatus("");
              setSelectedDate("");
              setSortOption("newest");
            }}
            setIsOpen={setIsOpen}
          />
        </div>
      </div>

      {/* Right content */}
      <div
        className="flex-1 p-8 px-8 md:px-28 pt-0 max-w-5xl mx-auto overflow-y-auto"
        style={{ height: 'calc(100vh - 3.5rem)', overflowX: 'hidden' }}
      >
        <h1 className="text-3xl font-bold mb-4 md:mb-8 text-gray-800 pt-8">Λίστα Παραγγελιών</h1>

        <div className="md:hidden mb-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold w-full"
          >
            {isOpen ? "Κλείσιμο φίλτρων" : "Άνοιγμα φίλτρων"}
          </button>
        </div>

        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center">
              <p className="font-semibold text-gray-900">Παραγγελία #{order.id}</p>
              <span
                className={`px-3 py-1 font-medium rounded-lg ${
                  order.status === "completed"
                    ? "bg-green-500 text-white"
                    : order.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : order.status === "rejected"
                    ? "bg-red-500 text-white"
                    : order.status === "cancelled"
                    ? "bg-red-400 text-white"
                    : order.status === "requested"
                    ? "bg-green-500 text-white"
                    : "bg-gray-300 text-white"
                }`}
              >
                {order.status === "completed"
                  ? "Ολοκληρώθηκε"
                  : order.status === "pending"
                  ? "Σε εκκρεμότητα"
                  : order.status === "rejected"
                  ? "Απορρίφθηκε"
                  : order.status === "cancelled"
                  ? "Ακυρώθηκε"
                  : order.status === "requested"
                  ? "Αιτήθηκε"
                  : "Άγνωστο"}
              </span>
            </div>

            {!expandedItems[order.id] && (
              <div className="p-4 pb-0 space-y-3">
                <p className="text-gray-700">
                  <strong>Όνομα:</strong> {order.user.name}
                </p>

                <p className="text-gray-700">
                  <strong>Διεύθυνση:</strong> {order.user.address}
                </p>

                <p className="text-gray-700">
                  <strong>Όροφος:</strong> {order.user.floor}
                </p>

                <p className="text-gray-700">
                  <strong>Κουδούνι:</strong> {order.user.bellName}
                </p>

                {order.user.comment && (
                  <p className="text-gray-700">
                    <strong>Σχόλιο:</strong> {order.user.comment}
                  </p>
                )}

                <p className="text-gray-700">
                  <strong>Δημιουργήθηκε: </strong> 
                  {new Date(order.createdAt).toLocaleString("el-GR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>

                {/* Items */}
                <ul className="space-y-3">
                  {order.items.map((item) => {
                    // Calculate extras
                    const optionsTotal = item.selectedOptions.reduce(
                      (acc, opt) => acc + Number(opt.price || 0),
                      0
                    );
                    const ingredientsTotal = item.ingredients?.reduce(
                      (acc, ing) => acc + Number(ing.price || 0),
                      0
                    ) || 0;

                    // Total per item
                    const itemTotal = (Number(item.price) - (optionsTotal + ingredientsTotal)) * item.quantity;

                    return (
                      <li
                        key={item.id}
                        className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-800">
                            {item.quantity} × {item.product?.name}
                          </span>
                          <span className="text-gray-700">{itemTotal.toFixed(2)}€</span>
                        </div>

                        {item.ingredients && item.ingredients.length > 0 && (
                          <ul className="ml-5 mt-2 text-sm text-gray-600 list-disc">
                            {item.ingredients.map((ing) => (
                              <li key={ing.id}>
                                {ing.ingredient?.name}{" "}
                                {ing.price ? `(${Number(ing.price).toFixed(2)}€)` : ""}
                              </li>
                            ))}
                          </ul>
                        )}

                        {item.selectedOptions.length > 0 && (
                          <ul className="ml-5 mt-2 text-sm text-gray-600 list-disc">
                            {item.selectedOptions.map((opt) => (
                              <li key={opt.id}>
                                {opt.comment}{" "}
                                {opt.price ? `(${Number(opt.price).toFixed(2)}€)` : ""}
                              </li>
                            ))}
                          </ul>
                        )}
                        <span className="mt-2">Σύνολο:</span> {Number(item.price).toFixed(2)}€
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex flex-row items-center justify-between p-4 pt-2 pb-2">
              <p className="text-gray-700 text-xl">
                <strong>Σύνολο:</strong> {Number(order.total).toFixed(2)}€
              </p>
              <button
                className="mt-2 flex items-center text-blue-500 hover:underline text-sm gap-1"
                onClick={() => toggleItem(order.id)}
              >
                <span>{!expandedItems[order.id] ? "Απόκρυψη λεπτομερειών" : "Εμφάνιση λεπτομερειών"}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    !expandedItems[order.id] ? "rotate-180" : ""
                  }`}
                />
              </button>
              <p
                className="text-gray-900 bg-gray-400 p-2 rounded-lg"
              >
                {order.paidIn === "POS" ? (
                  <>
                    <strong>Πληρωμή με POS</strong>
                  </>
                ) : order.paidIn === "door" ? (
                  <>
                    <strong>Πληρωμή με Μετρητά</strong>
                  </>
                ) : order.paidIn === "online" ? (
                  <>
                    <strong>Πληρωμή Online</strong>
                  </>
                ) : (
                  <>{order.paidIn}</>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
