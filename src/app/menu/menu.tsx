"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import Footer from '../footer';
import Link from "next/link";
import ProductModal from "./productModal";

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
};


export default function Menu({ categories }: { categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<number>(categories[0]?.id || 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});

  const addToCart = (product: Product) => {
    setOrderItems((prev) => {
        // Check if product already exists in cart
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
        // Increase quantity if exists
        return prev.map((item) =>
            item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        }
        // Otherwise add new item
        return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    setSelectedProduct(null); // close modal after adding
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

        <div
        className={`w-64 bg-gray-100 p-4 border-l transition-all duration-300 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } fixed right-0 top-[55px] z-50`}
        style={{ height: `calc(100vh - 55px)` }} // dynamic height
        >
        {/* Button aligned to the right */}
        <div className="flex justify-end mb-4">
            <button
            className="px-4 py-2 bg-gray-900 text-white rounded"
            onClick={() => setIsSidebarOpen(false)}
            >
            Close Sidebar
            </button>
        </div>

        <h3 className="font-bold text-lg mb-4">Καλάθι Παραγγελιών</h3>

        {/* Order Items */}
        <div className="space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100% - 80px)" }}>
            {orderItems.length === 0 ? (
            <p className="text-gray-500">Το καλάθι είναι άδειο.</p>
            ) : (
            orderItems.map((item) => (
                <div key={item.productId} className="border p-2 rounded flex justify-between items-center">
                <div>
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-sm text-gray-600">Ποσότητα: {item.quantity}</p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            ))
            )}
        </div>

        {/* Total and Checkout */}
        {orderItems.length > 0 && (
            <div className="mt-4 border-t pt-4">
            <p className="font-bold mb-2">
                Σύνολο: ${orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </p>
            <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                Πλήρωμή
            </button>
            </div>
        )}
        </div>

        {/* Open Sidebar Button */}
        {!isSidebarOpen && (
            <button
            className="fixed right-0 top-[90px] -translate-y-1/2 px-4 py-2 bg-gray-400 text-white rounded-l z-40"
            onClick={() => setIsSidebarOpen(true)}
            >
            Open Sidebar
            </button>
        )}
      </div>
      {selectedProduct && (
        <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            addToCart={addToCart}
        />
        )}

      {/* Footer */}
      <Footer />
    </div>
  );
}