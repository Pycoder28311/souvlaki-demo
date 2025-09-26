"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import ProductModal from "./menu/productModal";
import { Dispatch, SetStateAction } from "react";

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

type ImageType = {
  id: number
  data: Uint8Array
  createdAt: Date
}

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  productId?: number;
};

type Product = {
  id: number
  name: string
  price: number
  offer: boolean
  description: string;
  image?: ImageType | null
  imageId?: number | null; 
  ingCategories?: IngCategory[];
  options?: Option[];
}

type Ingredient = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
};

type User = {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
  address?: string;
};

export default function MenuGrid({
  addToCart,
  selectedProduct,
  setSelectedProduct,
}: ProductModalProps) {
  const [menuItems, setMenuItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

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

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        if (!response.ok) throw new Error("Failed to fetch session data");

        const session = await response.json();
        if (session?.user) {
          setUser(session.user);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (menuItems.length === 0) return <p>No products on offer.</p>;

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
                No Image
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            {/* Title & Price */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <span className="text-lg font-bold text-yellow-600">€{item.price}</span>
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
          email={user?.email}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
        />
      )}
    </div>
  );
}
