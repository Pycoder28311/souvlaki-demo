"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import Footer from '../footer';
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  offer: boolean;
  image?: string;
};

type Category = {
  id: number;
  name: string;
  products: Product[];
};

export default function Menu({ categories }: { categories: Category[] }) {
  const [activeCategory, setActiveCategory] = useState<number>(categories[0]?.id || 0);
  const [isScrolled, setIsScrolled] = useState(false);

  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});

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

      {/* Menu Categories */}
      <section
        className={`sticky z-30 py-4 border-b transition-all duration-300 ${
          isScrolled ? "bg-gray-50 shadow-md" : "bg-white"
        } top-[45px] md:top-[55px]`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-6 space-y-12">
        {categories.map((category) => (
            <section key={category.id} 
            ref={(el) => {
                categoryRefs.current[category.id] = el; // just assign, do NOT return anything
            }}>
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {category.products.map((product) => (
                <div
                    key={product.id}
                    className="border p-4 rounded shadow hover:shadow-md transition"
                >
                    {product.image && (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded mb-2"
                    />
                    )}
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    {product.offer && <p className="text-red-500 font-semibold">On Offer!</p>}
                    <p className="mt-1 font-semibold">${product.price.toFixed(2)}</p>
                </div>
                ))}
            </div>
            </section>
        ))}
        </div>

      {/* Menu Items
      <section 
        className="py-24 bg-white"
        style={{
          backgroundImage: "url('/covertrue.jpg')",
          backgroundAttachment: "fixed",
        }} 
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {menuData[activeCategory as keyof typeof menuData].map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg w-full max-w-sm mx-auto"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 mt-1">{item.description}</p>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.price}</span>
                </div>
                <div className="flex justify-center mt-4">
                  <Link
                    href="https://www.e-food.gr/"
                    target="_blank" // ανοίγει σε νέα καρτέλα
                    className="bg-gray-900 hover:bg-yellow-500 text-white hover:text-gray-900 px-4 py-2 font-bold transition-colors inline-block text-center"
                  >
                    Προσθήκη στο καλάθι
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Special Offers */}
      <section id="special-offers" className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Ειδικές Προσφορές</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 p-8 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-yellow-500 flex items-center justify-center mr-4">
                  <span className="text-white font-bold">-20%</span>
                </div>
                <h3 className="text-xl font-bold">Προσφορά Σαββάτου</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Κάθε Σάββατο απόγευμα, από 18:00 - 22:00, έκπτωση 20% σε όλα τα σουβλάκια.
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 p-8 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-yellow-500 flex items-center justify-center mr-4">
                  <span className="text-white font-bold">2+1</span>
                </div>
                <h3 className="text-xl font-bold">Δώρο για Ομάδες</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Για παραγγελίες άνω των 10 σουβλακιών, το 11ο δώρο!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}