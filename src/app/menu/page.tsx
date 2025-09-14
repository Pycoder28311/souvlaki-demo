"use client";

import { useState, useEffect } from "react";
import Head from 'next/head';
import Navbar from '../navigator';
import Footer from '../footer';
import Link from "next/link";

export default function Menu() {
  type Category = "souvlakia" | "piates" | "merides" | "salates" | "anapsyktika" | "pies" | "drinks";

  const categories: { key: Category; label: string }[] = [
    { key: "souvlakia", label: "Σουβλάκια" },
    { key: "piates", label: "Πιάτα" },
    { key: "merides", label: "Μερίδες" },
    { key: "salates", label: "Σαλάτες" },
    { key: "anapsyktika", label: "Αναψυκτικά" },
    { key: "pies", label: "Πίτες" },
    { key: "drinks", label: "Ποτά" },
  ];

  const [activeCategory, setActiveCategory] = useState<Category>("souvlakia");
  const [isScrolled, setIsScrolled] = useState(false);

  const menuData = {
    souvlakia: [
      { id: 1, name: 'Καλαμάκι Χοιρινό', description: '', price: '€2.80' },
      { id: 2, name: 'Καλαμάκι Κοτόπουλο', description: '', price: '€2.70' },
      { id: 3, name: 'Καλαμάκι Μοσχαρίσιο', description: '', price: '€3.20' },
    ],
    piates: [
      { id: 1, name: 'Πίτα Γύρο Χοιρινό', description: '', price: '€4.20' },
      { id: 2, name: 'Πίτα Γύρο Κοτόπουλο', description: '', price: '€4.00' },
      { id: 3, name: 'Πίτα Μικτή', description: '', price: '€4.50' },
    ],
    merides: [
      { id: 1, name: 'Πατάτες Τηγανιτές', description: 'Φρεσκοτηγανισμένες πατάτες', price: '€2.50' },
      { id: 2, name: 'Ρύζι', description: 'Αρωματικό ρύζι με λαδί', price: '€2.00' },
      { id: 3, name: 'Γαύρος', description: 'Τραγανός γαύρος με σκόρδο', price: '€3.50' },
      { id: 4, name: 'Τζατζίκι', description: 'Γιαούρτι με αγγούρι και σκόρδο', price: '€1.80' },
    ],
    salates: [
      { id: 1, name: 'Χωριάτικη Σαλάτα', description: 'Ντομάτα, αγγούρι, κρεμμύδι, ελιές, φέτα', price: '€5.00' },
      { id: 2, name: 'Μαρουλοσαλάτα', description: 'Φρέσκο μαρούλι με λάδι και ξύδι', price: '€3.00' },
      { id: 3, name: 'Ντοματοσαλάτα', description: 'Φρέσκια ντομάτα με κρεμμύδι και φέτα', price: '€4.00' },
      { id: 4, name: 'Μελιτζανοσαλάτα', description: 'Μελιτζάνες ψητές με σκόρδο και λάδι', price: '€3.50' },
      { id: 5, name: 'Ταραμοσαλάτα', description: 'Ταραμάς με πατάτα', price: '€4.00' },
      { id: 6, name: 'Σκορδαλιά', description: 'Πατάτα με σκόρδο και ελαιόλαδο', price: '€3.20' },
    ],
    anapsyktika: [
      { id: 1, name: 'Pepsi', description: 'Αναψυκτικό 330ml', price: '€1.80' },
      { id: 2, name: 'Coca-Cola', description: 'Αναψυκτικό 330ml', price: '€1.80' },
      { id: 3, name: 'Fanta', description: 'Αναψυκτικό 330ml', price: '€1.80' },
      { id: 4, name: 'Sprite', description: 'Αναψυκτικό 330ml', price: '€1.80' },
      { id: 5, name: 'Νερό', description: 'Μπουκάλι 500ml', price: '€1.00' },
      { id: 6, name: 'Χυμός Πορτοκάλι', description: 'Φυσικός χυμός πορτοκάλι', price: '€2.50' },
    ],
    pies: [
      { id: 1, name: 'Τυρόπιτα', description: 'Φύλλο με φέτα και αυγό', price: '€2.50' },
      { id: 2, name: 'Σπανακόπιτα', description: 'Φύλλο με σπανάκι και φέτα', price: '€2.70' },
      { id: 3, name: 'Κρεατόπιτα', description: 'Φύλλο με κιμά και μπεσαμέλ', price: '€3.20' },
      { id: 4, name: 'Μπουγάτσα', description: 'Γλυκιά μπουγάτσα με κρέμα', price: '€2.80' },
    ],
    drinks: [
      { id: 1, name: 'Μπύρα', description: '', price: '€3.00-€5.00' },
      { id: 2, name: 'Κρασί', description: '', price: '€4.50' },
      { id: 3, name: 'Ούζο', description: '', price: '€3.50' },
    ],
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

      {/* Navigation */}
      <Navbar scrolled={true}/>

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
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`inline-block px-6 py-3 font-bold transition-all flex-shrink-0 ${
                  activeCategory === cat.key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
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
      </section>

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