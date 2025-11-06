"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ProductModal from "../menu/productModal";
import { Dispatch, SetStateAction } from "react";
import { useCart } from "../wrappers/cartContext";
import { Option, Product, Ingredient, IngCategory } from "../types";

interface ProductModalProps {
  addToCart: (
    product: Product,
    selectedIngredients: Ingredient[],
    selectedIngCategories: IngCategory[], 
    selectedOptions: Option[], 
    options: Option[]
  ) => void;
  selectedProduct: Product | null;
  setSelectedProduct: Dispatch<SetStateAction<Product | null>>;
}

interface ProductWithCategory extends Product {
  category: {
    id: number;
    name: string;
    openHour: string;
    closeHour: string;
    alwaysClosed: boolean;
  };
}


export default function MenuGrid({
  addToCart,
  selectedProduct,
  setSelectedProduct,
}: ProductModalProps) {
  const [menuItems, setMenuItems] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, shopOpen } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/offers");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setMenuItems(data); // πλέον κάθε item περιέχει και category info
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-24 pr-6 pl-6 md:pr-12 md:pl-12">
        {[1, 2, 3].map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-200 shadow-md flex flex-col animate-pulse"
          >
            {/* Image placeholder */}
            <div className="h-48 bg-gray-200 rounded-t-xl" />

            {/* Content placeholder */}
            <div className="p-5 flex flex-col flex-1 gap-2">
              {/* Title */}
              <div className="h-5 bg-gray-300 rounded w-3/4"></div>
              {/* Price */}
              <div className="h-5 bg-gray-300 rounded w-1/4 mt-1"></div>
              {/* Description */}
              <div className="h-4 bg-gray-300 rounded w-full mt-2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              {/* Button */}
              <div className="h-10 bg-gray-300 rounded mt-auto"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (menuItems.length === 0) return <></>;

  return (
    <div className="grid md:grid-cols-3 gap-24 pr-6 pl-6 md:pr-12 md:pl-12">

      {menuItems.map((item, index) => {
        // Έλεγχος διαθεσιμότητας
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const category = item.category;

        //const category = item.category; // assuming each product has category info
        const isAvailable =
          item &&
          !item.alwaysClosed &&
          item.openHour &&
          item.closeHour &&
          currentTime >= item.openHour &&
          currentTime <= item.closeHour &&
          category &&
          !category.alwaysClosed &&
          category.openHour &&
          category.closeHour &&
          currentTime >= category.openHour &&
          currentTime <= category.closeHour;

        return (
          <div
            key={index}
            className={`bg-white rounded-xl border border-gray-200 shadow-md transition-all duration-300 transform flex flex-col
                        ${isAvailable ? 'hover:-translate-y-2 hover:shadow-lg' : 'opacity-50 cursor-not-allowed'}`}
            onClick={() => {
              if (user?.business || isAvailable) setSelectedProduct(item);
            }}
          >
            {/* Image */}
            <div className="h-48 relative">
              {item?.imageId && (
                <Image
                  src={`/api/images/${item.imageId}`}
                  alt={`image of ${item.name}`}
                  fill
                  className="object-cover rounded-t-xl"
                />
              )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <div className="mb-2">
                <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                <p className="font-bold text-yellow-600 text-lg mt-1 flex items-center gap-2">
                  <span>{Number(item.price).toFixed(2)}€</span>
                  {item.offerPrice && (
                    <span className="line-through text-gray-400">{Number(item.offerPrice).toFixed(2)}€</span>
                  )}
                </p>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              )}

              {/* Button */}
              <button
                onClick={() => {
                  if (!shopOpen || !isAvailable) return;
                  if (user?.business && isAvailable) setSelectedProduct(item);
                }}
                disabled={!isAvailable}
                className={`mt-auto w-full rounded-lg text-white px-4 py-2 font-semibold transition-colors
                            ${isAvailable ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {shopOpen
                  ? isAvailable
                    ? 'Προσθήκη στο Καλάθι'
                    : 'Μη διαθέσιμο'
                  : 'Το κατάστημα είναι κλειστό'}
              </button>
            </div>
          </div>
        );
      })}

      {selectedProduct && (
        <ProductModal
          business={user?.business}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
        />
      )}
    </div>
  );
}
