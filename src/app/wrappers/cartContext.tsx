"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { OrderItem, Product, Ingredient, IngCategory, Option, User } from "../types";
import { usePathname } from "next/navigation";

interface CartContextType {
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quantity, setQuantity] = useState(1);
  const pathnameRaw = usePathname();
  const pathname = pathnameRaw ?? ""; // default to empty string
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

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

        const totalPrice = product.price + ingredientsTotal + optionsTotal;

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
    const fetchRadius = async () => {
      try {
        const res = await fetch("/api/business-valid-radius");
        if (!res.ok) throw new Error("Failed to fetch valid radius");

        const radius: number = await res.json();
        setValidRadius(radius);
      } catch (err) {
        console.error(err);
      }
    };
    if (!user?.business) {
      fetchRadius();
    }
  }, [user?.business, validRadius]);

  const getUserAddress = async () => {
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

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
          setAddress(session.user.address ? session.user.address.split(",")[0] : "");

          if (session.user.validRadius == null && session.user.business) {
            setShowRadiusNote(true);
          }

          if (!session.user.address) {
            const address = await getUserAddress();
            if (address) {
              const distanceRes = await fetch("/api/get-distance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ origin: address }),
              });

              const distanceData = await distanceRes.json();
              const distanceToDestination = distanceData.distanceValue; 

              if (validRadius != null && distanceToDestination > Number(validRadius)) {
                alert(
                  `Προειδοποίηση: Η απόσταση προς τον προορισμό υπερβαίνει την δυνατή απόσταση παραγγελίας.`
                );
              }

              // Then, update the user with the distance included
              await fetch("/api/update-address", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: session.user.email, address, distanceToDestination }),
              });
              
              setAddress((session.user.address as string)?.split(",")[0] ?? "");
            }
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  return (
    <CartContext.Provider
      value={{
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
