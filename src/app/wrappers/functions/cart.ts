import { OrderItem, Product, User } from "../../types"; 

type ProductWithAvailability = Product & {
  available: boolean;
  unavailableReason: string;
};

type Availability = {
  available: boolean;
  unavailableReason?: string;
};

export const handlePayment = async (
  paidIn: string,
  user: User | null,
  orderItems: OrderItem[],
  removeItem: (item: OrderItem) => void,
  setIsSidebarOpen: (val: boolean) => void,
  setShowPaymentModal: (val: boolean) => void
) => {
  try {
    const userId = user?.id;
    const payload = {
      userId,
      items: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        ingredients: item.selectedIngredients || [],
        options: item.options,
        selectedOptions: item.selectedOptions,
      })),
      paid: false,
    };

    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, paidIn }),
    });

    const data = await res.json();

    if (data.success) {
      orderItems.forEach((item) => removeItem(item));
      setIsSidebarOpen(false);
      setShowPaymentModal(false);
      window.location.href = "/success";
    } else {
      alert("Σφάλμα κατά τη δημιουργία παραγγελίας: " + data.error);
    }
  } catch (err) {
    console.error(err);
    alert("Κάτι πήγε στραβά.");
  }
};

export const handleSearch = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setQuery: (val: string) => void,
  setResults:  (val: string[]) => void,
) => {
  setQuery(e.target.value);

  if (e.target.value.length < 3) {
    setResults([]);
    return;
  }

  const res = await fetch(
    `/api/search-address?query=${encodeURIComponent(e.target.value)}`
  );
  const data = await res.json();
  setResults(data.suggestions || []);
};

export const handleUpdateAddress = async (
  user: User | null,
  address: string,
  query: string,
  results: string[],
  setUser: (user: User) => void,
  setAddress: (address: string) => void,
  setWarning: (msg: string) => void,
  setEditingAddress: (val: boolean) => void,
  validRadius: number | null,
) => {
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
    setWarning("");
    setUser(data.updatedUser);
    setAddress(data.updatedUser.address);

    if (validRadius && data.distanceValue > validRadius) {
      setWarning(
        "Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας."
      );
    } else {
      setWarning("Η διεύθυνσή σας αποθηκεύτηκε απιτυχώς");
      setEditingAddress(false);
    }
  } catch (err) {
    console.error("Error updating user:", err);
  }
};

export const getUnavailableMessage = (reason?: string) => {
  switch (reason) {
    case "alwaysClosed":
      return "Μη διαθέσιμο";
    case "closedNow":
      return "Μη διαθέσιμο: εκτός ωραρίου";
    case "noHoursSet":
      return "Μη διαθέσιμο: δεν έχουν οριστεί ώρες";
    default:
      return "";
  }
};

export const handleCheckHours = async (
  orderItems: OrderItem[],
  availabilityMap: Record<string, Availability>,
  setAvailabilityMap: React.Dispatch<React.SetStateAction<Record<string, Availability>>>,
  setShowPaymentModal: (val: boolean) => void,
  setPaymentWayModal: (val: boolean) => void
) => {
  try {
    setShowPaymentModal(true);

    const res = await fetch("/api/get-order-hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: orderItems.map((i) => i.productId) }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data.error);
      return;
    }

    data.products.forEach((p: ProductWithAvailability) => {
      availabilityMap[p.id.toString()] = {
        available: p.available,
        unavailableReason: !p.available ? p.unavailableReason : undefined,
      };
    });

    setAvailabilityMap({ ...availabilityMap });

    const allAvailable = data.products.every((p: ProductWithAvailability) => p.available);
    if (!allAvailable) {
      setShowPaymentModal(false);
      setPaymentWayModal(false);
    }
  } catch (err) {
    console.error("Error fetching order hours:", err);
  }
};

export const handleUpdateAll = async (
  user: User | null,
  selectedFloor: string,
  bellName?: string,
  userComment?: string,
  setUser?: (user: User) => void
) => {
  try {
    const res = await fetch(`/api/user/${user?.id}/update-user-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ floor: selectedFloor, bellName, comment: userComment }),
    });

    if (!res.ok) throw new Error("Failed to update user details");

    const data = await res.json();
    if (data.user && setUser) setUser(data.user);
  } catch (err) {
    console.error(err);
    alert("Πρόβλημα κατά την ενημέρωση των στοιχείων.");
  }
};

export const handleClickDoor = (
  router: ReturnType<typeof import("next/navigation").useRouter>,
  paidIn: string,
  user: User | null,
  orderItems: OrderItem[],
  removeItem: (item: OrderItem) => void,
  setIsSidebarOpen: (val: boolean) => void,
  setShowPaymentModal: (val: boolean) => void,
) => {
  if (!user) {
    router.push("/auth/login-options");
    return;
  }

  handlePayment(paidIn, user, orderItems, removeItem, setIsSidebarOpen, setShowPaymentModal);
};
