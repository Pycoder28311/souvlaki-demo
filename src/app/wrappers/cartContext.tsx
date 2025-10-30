"use client";

import React, { createContext, useState, useEffect, useContext, useCallback} from "react";
import { OrderItem, Product, Ingredient, IngCategory, Option, User } from "../types";
import { usePathname } from "next/navigation";

type Schedule = {
  open: string | null;
  close: string | null;
};

interface CartContextType {
  showWelcome: boolean;
  setShowWelcome: React.Dispatch<React.SetStateAction<boolean>>,
  orderItems: OrderItem[];
  addToCart: (
    product: Product,
    selectedIngredients: Ingredient[],
    selectedIngCategories: IngCategory[],
    selectedOptions: Option[],
    options: Option[]
  ) => void;
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  removeItem: (item: OrderItem) => void;
  editItem: (orderItemToEdit: OrderItem, newIngredients: Ingredient[], selectedOptions?: Option[] | undefined) => void;
  changeQuantity: (delta: number) => void;
  quantity: number;
  setQuantity: (qty: number) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  selectedFloor: string;
  setSelectedFloor: React.Dispatch<React.SetStateAction<string>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  showRadiusNote: boolean;
  setShowRadiusNote: React.Dispatch<React.SetStateAction<boolean>>;
  validRadius: number | null;
  setValidRadius: React.Dispatch<React.SetStateAction<number | null>>;
  shopOpen: boolean;
  cartMessage: string;
}

type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type DayFromAPI = {
  id: number;
  dayOfWeek: Weekday;
  openHour: string | null;
  closeHour: string | null;
  alwaysClosed: boolean;
};

type Override = {
  date: string;       // ISO string "YYYY-MM-DD"
  openHour: string | null;
  closeHour: string | null;
  recurringYearly: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quantity, setQuantity] = useState(1);
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? ""; // default to empty string
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [overrides, setOverrides] = useState<Override[]>([]);
  const [cartMessage, setCartMessage] = useState("Φόρτωση...");

  const [weeklySchedule, setWeeklySchedule] = useState<Record<Weekday, Schedule>>({
    Monday: { open: null, close: null },
    Tuesday: { open: null, close: null },
    Wednesday: { open: null, close: null },
    Thursday: { open: null, close: null },
    Friday: { open: null, close: null },
    Saturday: { open: null, close: null },
    Sunday: { open: null, close: null },
  });

  const isShopOpenNow = useCallback(
    (
      scheduleData: Record<Weekday, Schedule> = weeklySchedule,
      overrideData: Override[] = overrides
    ): boolean => {
      const now = new Date();
        // 1️⃣ Check overrides first
      const overrideToday = overrideData.find((o) => {
        const overrideDate = new Date(o.date);

        // If override is rejected yearly, compare only month and day
        if (o.recurringYearly) {
          return (
            overrideDate.getMonth() === now.getMonth() &&
            overrideDate.getDate() === now.getDate()
          );
        }

        // Otherwise compare full date (year, month, day)
        return (
          overrideDate.getFullYear() === now.getFullYear() &&
          overrideDate.getMonth() === now.getMonth() &&
          overrideDate.getDate() === now.getDate()
        );
      });
      
      if (overrideToday) {
        if (!overrideToday.openHour || !overrideToday.closeHour) return false;
        const [openH, openM] = overrideToday.openHour.split(":").map(Number);
        const [closeH, closeM] = overrideToday.closeHour.split(":").map(Number);
        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;
        const nowMinutes = now.getHours() * 60 + now.getMinutes();

        if (closeMinutes < openMinutes) {
          // Overnight
          return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
        }

        return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
      }

      // 2️⃣ Fallback to regular weekly schedule
      const dayName = now.toLocaleDateString("en-US", { weekday: "long" }) as Weekday;
      const schedule = scheduleData[dayName];
      if (!schedule?.open || !schedule?.close) return false;

      const [openH, openM] = schedule.open.split(":").map(Number);
      const [closeH, closeM] = schedule.close.split(":").map(Number);
      const openMinutes = openH * 60 + openM;
      const closeMinutes = closeH * 60 + closeM;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      if (closeMinutes < openMinutes) {
        // Overnight
        return nowMinutes >= openMinutes || nowMinutes <= closeMinutes;
      }

      return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
    },
    [weeklySchedule, overrides]
  );

  const [shopOpen, setShopOpen] = useState(true);
  // Fetch weekly schedule from API
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch("/api/schedule/get");
        const data = await res.json();

        if (data.weekly) {
          const scheduleMap: Record<Weekday, Schedule> = {
            Monday: { open: null, close: null },
            Tuesday: { open: null, close: null },
            Wednesday: { open: null, close: null },
            Thursday: { open: null, close: null },
            Friday: { open: null, close: null },
            Saturday: { open: null, close: null },
            Sunday: { open: null, close: null },
          };

          data.weekly.forEach((day: DayFromAPI) => {
            scheduleMap[day.dayOfWeek as Weekday] = {
              open: day.openHour || null,
              close: day.closeHour || null,
            };
          });

          setWeeklySchedule(scheduleMap);
          setOverrides(data.overrides);
    
          const now = new Date();
          const dayName = now.toLocaleDateString("en-US", { weekday: "long" }) as Weekday;
          
          const todayOverride = data.overrides?.find((o: Override) => {
            const overrideDate = new Date(o.date);

            if (o.recurringYearly) {
              return (
                overrideDate.getMonth() === now.getMonth() &&
                overrideDate.getDate() === now.getDate()
              );
            }

            return (
              overrideDate.getFullYear() === now.getFullYear() &&
              overrideDate.getMonth() === now.getMonth() &&
              overrideDate.getDate() === now.getDate()
            );
          });

          if (todayOverride) {
            if (todayOverride.alwaysClosed) {
              setCartMessage("Το κατάστημα είναι κλειστό σήμερα");
            } else if (todayOverride.openHour && todayOverride.closeHour) {
              setCartMessage(
                `Ώρες λειτουργίας σήμερα: ${todayOverride.openHour} - ${todayOverride.closeHour}`
              );
            } else {
              setCartMessage("Το κατάστημα έχει ειδικό ωράριο σήμερα");
            }
          } else if (scheduleMap[dayName]?.open) {
            setCartMessage(
              `Ώρες λειτουργίας σήμερα: ${scheduleMap[dayName].open} - ${scheduleMap[dayName].close}`
            );
          } else {
            setCartMessage("Το κατάστημα είναι κλειστό σήμερα");
          }
        }
      } catch (err) {
        console.error("Failed to fetch schedule:", err);
        setShopOpen(false);
      }
    };

    fetchSchedule();
  }, []);

  useEffect(() => {
    setShopOpen(isShopOpenNow());
  }, [weeklySchedule, overrides, isShopOpenNow, cartMessage]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("orderItems");
      if (stored) setOrderItems(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to parse orderItems from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("orderItems", JSON.stringify(orderItems));
  }, [orderItems]);

  const addToCart = (
    product: Product,
    selectedIngredients: Ingredient[],
    selectedIngCategories: IngCategory[],
    selectedOptions: Option[],
    options: Option[]
  ) => {
    if (!shopOpen) return;
    setOrderItems((prev) => {
      const existing = prev.find((item) => {
        if (item.productId !== product.id) return false;

        const itemIngredients = item.selectedIngredients || [];
        if (itemIngredients.length !== selectedIngredients.length) return false;
        const ingredientsMatch = itemIngredients.every((ing) =>
          selectedIngredients.some((sel) => sel.id === ing.id)
        );

        const itemOptions = item.selectedOptions || [];
        if (itemOptions.length !== selectedOptions.length) return false;
        const optionsMatch = itemOptions.every((opt) =>
          selectedOptions.some((sel) => sel.id === opt.id)
        );

        return ingredientsMatch && optionsMatch;
      });

      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        const ingredientsTotal = selectedIngredients.reduce(
          (sum, ing) => sum + Number(ing.price),
          0
        );
        const optionsTotal = selectedOptions.reduce(
          (sum, opt) => sum + Number(opt.price),
          0
        );

        const totalPrice = Number(product.price) + ingredientsTotal + optionsTotal;

        return [
          ...prev,
          {
            imageId: product.imageId ?? null,
            productId: product.id,
            name: product.name,
            price: totalPrice,
            quantity: 1,
            selectedIngredients,
            selectedIngCategories,
            selectedOptions,
            options,
          },
        ];
      }
    });
  };

  const editItem = (
    orderItemToEdit: OrderItem,
    newIngredients: Ingredient[],
    selectedOptions?: Option[] | undefined, // εδώ χρησιμοποιούμε τον τύπο SelectedOption { id, value: "yes" | "no" }
  ) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item === orderItemToEdit
          ? {
              ...item,
              quantity: quantity,
              selectedIngredients: newIngredients,
              selectedOptions: selectedOptions || [], // προσθήκη options
              // Recalculate price: base price + sum of ingredient prices
              price:
              orderItemToEdit.price
              - (item.selectedIngredients?.reduce((sum, ing) => sum + Number(ing.price), 0) || 0)
              + newIngredients.reduce((sum, ing) => sum + Number(ing.price), 0)
              - (item.selectedOptions?.reduce((sum, opt) => sum + Number(opt.price), 0) || 0)
              + (selectedOptions?.reduce((sum, opt) => sum + Number(opt.price), 0) || 0),
          }
          : item
      )
    );
  };

  const changeQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta)); // min 1
  };

  const removeItem = (item: OrderItem) => {
    setOrderItems((prev) => {
      const updated = prev.filter((itm) => itm !== item);

      // Optional: immediately update localStorage (redundant if you already have the useEffect)
      localStorage.setItem("orderItems", JSON.stringify(updated));

      return updated;
    });
  }

  const OpenSidebarPaths = ["/menu"];
  const Open = OpenSidebarPaths.includes(pathname);

  const [isSidebarOpen, setIsSidebarOpen] = useState(Open);

  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isSidebarOpen && isMobile) {
    // Disable background scroll
    document.body.style.overflow = "hidden";
    } else {
    // Re-enable when closed
    document.body.style.overflow = "";
    }

    // Cleanup when component unmounts
    return () => {
    document.body.style.overflow = "";
    };
  }, [isSidebarOpen]);

  const [user, setUser] = useState<User | null>(null);
  const [selected, setSelected] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("");
  const [address, setAddress] = useState("");
  const [showRadiusNote, setShowRadiusNote] = useState(false);
  const [validRadius, setValidRadius] = useState<number | null>(null);
  
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);

          if (typeof session.user.address === "string") {
            setAddress(session.user.address.split(",")[0]);
          }

          if (session.user.validRadius == null && session.user.business) {
            setShowRadiusNote(true);
          }
        }

        if (session.validRadius) {
          setValidRadius(session.validRadius)
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  const getUserAddress = async (): Promise<string | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&language=el&key=${process.env.NEXT_PUBLIC_GEOLOCATION_API}`
            );
            const data = await res.json();
            resolve(data.results?.[0]?.formatted_address || null);
          } catch (err) {
            console.error("Failed to fetch address:", err);
            resolve(null);
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          resolve(null);
        }
      );
    });
  };

  // 2️⃣ When user exists but has no address → fetch geolocation
  useEffect(() => {
    if (!user || user.address) return;

    const resolveAddress = async () => {
      const geoAddress = await getUserAddress();
      if (!geoAddress) return;

      setAddress(geoAddress.split(",")[0]);

      try {
        const response = await fetch("/api/update-address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            address: geoAddress,
          }),
        });

        if (!response.ok) throw new Error("Failed to update user");

        const data = await response.json();
        setUser(data.updatedUser); // update user state
      } catch (error) {
        console.error("Error updating user:", error);
      }
    };

    resolveAddress();
  }, [user]);

  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <CartContext.Provider
      value={{
        showWelcome,
        setShowWelcome,
        orderItems,
        addToCart,
        setOrderItems,
        removeItem,
        editItem,
        changeQuantity,
        quantity,
        setQuantity,
        isSidebarOpen,
        setIsSidebarOpen,

        user,
        setUser,
        selected,
        setSelected,
        selectedFloor,
        setSelectedFloor,
        address,
        setAddress,
        showRadiusNote,
        setShowRadiusNote,
        validRadius,
        setValidRadius,
        shopOpen,            
        cartMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
