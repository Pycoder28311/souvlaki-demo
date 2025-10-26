"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ProductModal from "../menu/productModal";
import { Dispatch, SetStateAction } from "react";
import { useCart } from "../wrappers/cartContext";
import { ImageType, Option, Product, Ingredient, IngCategory } from "../types";

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

export default function MenuGrid({
  addToCart,
  selectedProduct,
  setSelectedProduct,
}: ProductModalProps) {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/offers");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setMenuItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <p>Φόρτωση...</p>;
  if (menuItems.length === 0) return <></>;

  return (
    <div className="grid md:grid-cols-3 gap-24 pr-6 pl-6 md:pr-12 md:pl-12">

      {menuItems.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-md transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg flex flex-col"
        >
          {/* Image */}
          <div className="h-48 relative">
            {item?.imageId ? (
              <Image
                src={`/api/images/${item.imageId}`}
                alt={`image of ${item.name}`}
                fill
                className="object-cover rounded-t-xl"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-600 rounded-t-xl">
                Χωρίς Εικόνα
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Title & Price */}
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
              <p className="font-bold text-yellow-600 text-lg mt-1 flex items-center gap-2">
                <span>{Number(item.price).toFixed(2)}€</span>
                {item.offerPrice && (
                  <span className="line-through text-gray-400">{Number(item.offerPrice).toFixed(2)}€</span>
                )}
              </p>
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Button */}
            <button
              onClick={() => setSelectedProduct(item)}
              className="mt-auto w-full bg-green-600 hover:bg-green-700 rounded-lg text-white px-4 py-2 font-semibold transition-colors"
            >
              Προσθήκη στο Καλάθι
            </button>
          </div>
        </div>
      ))}

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
