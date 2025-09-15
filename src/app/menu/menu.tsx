"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import Footer from '../footer';
import EditModal from "./editModal";
import ProductModal from "./productModal";
import OrderSidebar from "../cart";

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

type Product = {
  id: number;
  name: string;
  price: number;
  offer: boolean;
  image?: string;
  ingCategories?: IngCategory[]; // lazy-loaded
};

type Category = {
  id: number;
  name: string;
  products: Product[];
};

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
};

export default function Menu({ categories }: { categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<number>(categories[0]?.id || 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editableOrderItem, setEditableOrderItem] = useState<OrderItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // for viewing details
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    try {
      const stored = localStorage.getItem("orderItems");
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error("Failed to parse orderItems from localStorage:", err);
      return [];
    }
  });

  // Save to localStorage whenever orderItems change
  useEffect(() => {
    localStorage.setItem("orderItems", JSON.stringify(orderItems));
    
  }, [orderItems]);
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});
  const [quantity, setQuantity] = useState(editableOrderItem?.quantity || 1);

  const addToCart = (
    product: Product,
    selectedIngredients: Ingredient[],
    selectedIngCategories: IngCategory[] // 👈 add categories too
  ) => {
    setOrderItems((prev) => {
      // Check if product with same ingredients already exists
      const existing = prev.find((item) => {
        if (item.productId !== product.id) return false;

        const itemIngredients = item.selectedIngredients || [];
        if (itemIngredients.length !== selectedIngredients.length) return false;

        return itemIngredients.every((ing) =>
          selectedIngredients.some((sel) => sel.id === ing.id)
        );
      });

      if (existing) {
        return prev.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Otherwise add new item with categories too
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          selectedIngredients,
          selectedIngCategories, // 👈 store them here
        },
      ];
    });

    setSelectedProduct(null);
  };

  const editItem = (
    orderItemToEdit: OrderItem,
    newIngredients: Ingredient[],
  ) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item === orderItemToEdit
          ? {
              ...item,
              quantity: quantity,
              selectedIngredients: newIngredients,
            }
          : item
      )
    );

    setSelectedProduct(null); // close modal after updating
  };

  const changeQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta)); // min 1
  };

  const handleCategoryClick = (id: number) => {
    setActiveCategory(id);

    const ref = categoryRefs.current[id];
    if (ref) {
        const offset = 140; // adjust this to match your sticky header height
        const top = ref.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
        top,
        behavior: "smooth",
        });
    }
  };

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const removeItem = (item: OrderItem) => {
    setOrderItems((prev) => {
      const updated = prev.filter((itm) => itm !== item);

      // Optional: immediately update localStorage (redundant if you already have the useEffect)
      localStorage.setItem("orderItems", JSON.stringify(updated));

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Μενού | Σουβλατζίδικο</title>
        <meta name="description" content="Μενού αυθεντικών ελληνικών σουβλακιών" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="bg-gray-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Menu</h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            Από το 1985, δημιουργούμε αυθεντικά ελληνικά σουβλάκια με πάθος και αγάπη για την παραδοσιακή γεύση
          </p>
        </div>
      </section>

      <div className="flex gap-4">
        {/* Main Content */}
        <div
            className={`transition-all duration-300 ${
            isSidebarOpen ? "flex-1" : "flex-1"
            }`}
            style={{
            // shrink main content if sidebar is open
            marginRight: isSidebarOpen ? "16rem" : "0", // sidebar width = 64 = 16rem
            }}
        >
            {/* Categories Buttons */}
            <section className="sticky z-30 py-4 border-b bg-white top-[50px] p-6">
                <div className="flex gap-4 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:justify-center">
                    {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`inline-block px-6 py-3 font-bold transition-all flex-shrink-0 ${
                        activeCategory === cat.id
                            ? "bg-gray-900 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {cat.name}
                    </button>
                    ))}
                </div>
            </section>

            {/* Categories & Products */}
            <div className="space-y-12 mt-6 p-6">
            {categories.map((category) => (
                <section
                key={category.id}
                ref={(el) => {
                    categoryRefs.current[category.id] = el;
                }}
                >
                <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {category.products.map((product) => (
                        <div
                            key={product.id}
                            className="border p-4 rounded shadow hover:shadow-md transition cursor-pointer"
                            onClick={() => setSelectedProduct(product)} // open modal on click
                        >
                            {product.image && (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-40 object-cover rounded mb-2"
                            />
                            )}
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            {product.offer && (
                            <p className="text-red-500 font-semibold">On Offer!</p>
                            )}
                            <p className="mt-1 font-semibold">${product.price.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                </section>
            ))}
            </div>
        </div>
      </div>
      {selectedProduct && (
        <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            addToCart={addToCart}
        />
      )}

      {editableOrderItem && (
        <EditModal
          orderItem={editableOrderItem}
          defaultSelectedIngredients={editableOrderItem.selectedIngredients || []} // 👈 pass default ingredients
          onClose={() => setEditableOrderItem(null)}
          editItem={editItem}
          changeQuantity={changeQuantity}
          quantity={quantity}
        />
      )}

      <OrderSidebar
        orderItems={orderItems}
        setEditableOrderItem={setEditableOrderItem}
        setQuantity={setQuantity}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        removeItem={removeItem}
      />

      {/* Open Sidebar Button */}
      {!isSidebarOpen && (
          <button
          className="fixed right-0 top-[90px] -translate-y-1/2 px-4 py-2 bg-gray-400 text-white rounded-l z-40"
          onClick={() => setIsSidebarOpen(true)}
          >
          Open Sidebar
          </button>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}