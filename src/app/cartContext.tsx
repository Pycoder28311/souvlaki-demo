"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { OrderItem, Product, Ingredient, IngCategory, Option } from "./types";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quantity, setQuantity] = useState(1);
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
  };

  return (
    <CartContext.Provider value={{ orderItems, addToCart, setOrderItems, removeItem, editItem, changeQuantity, quantity, setQuantity }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
