"use client";

import Head from 'next/head';
import Image from 'next/image';
import Footer from './footer';
import Link from "next/link";
import homepage from "../../public/homepage.jpg";
import { useEffect, useRef, useState } from "react";
import RedSquareCarousel from './carousel';
import OrderSidebar from "./cart";
import EditModal from './menu/editModal';

export type User = {
  id: number;
  email: string;
  password: string;
  name: string;
  business: boolean;
};

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

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
};

export default function Home() {

  const offers = [
    {
      id: 1,
      badge: "-10%",
      title: "Προσφορά Σαββάτου",
      description: "Κάθε Σάββατο απόγευμα, από 18:00 - 22:00, έκπτωση 20% σε όλα τα σουβλάκια.",
    },
    {
      id: 2,
      badge: "2+1",
      title: "Δώρο για Ομάδες",
      description: "Για παραγγελίες άνω των 10 σουβλακιών, το 11ο δώρο!",
    },
  ];

  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<boolean[]>([false, false, false]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-index"));
          if (entry.isIntersecting) {
            setVisible((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        });
      },
      { threshold: 0.2 } // trigger when 20% visible
    );

    cardsRef.current.forEach((card) => card && observer.observe(card));

    return () => {
      cardsRef.current.forEach((card) => card && observer.unobserve(card));
    };
  }, []);

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
  };

  const changeQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta)); // min 1
  };

  const cards = [
    {
      title: "Τοποθεσία",
      icon: "📍",
      description: "Οδός Παραδείσου 123, Αθήνα",
    },
    {
      title: "Ωράριο",
      icon: "⏰",
      description: "Δευ-Παρ: 12:00 - 24:00\nΣαβ-Κυρ: 12:00 - 02:00",
    },
    {
      title: "Τηλέφωνο",
      icon: "📞",
      description: "210 123 4567\n694 123 4567",
    },
  ];

  type MenuItem = {
    name: string;
    description: string;
    price: string;
    imageSrc: string; // path to the image
    imageAlt: string;
  };

  const menuItems: MenuItem[] = [
    {
      name: "Σουβλάκι Χοιρινό",
      description: "Χοιρινό με άρωμα θυμάρι και λεμόνι, σε παραδοσιακό πίτα",
      price: "€2.80",
      imageSrc: "/hirino.jpg",
      imageAlt: "Σουβλάκι Χοιρινό",
    },
    {
      name: "Γύρος Κοτόπουλο",
      description: "Γύρος κοτόπουλου με γιαούρτι και φρέσκια λαχανικά",
      price: "€3.20",
      imageSrc: "/gyros.jpg",
      imageAlt: "Γύρος Κοτόπουλο",
    },
    {
      name: "Πίτα Γύρος Μικτή",
      description: "Μικτή πίτα με χοιρινό και κοτόπουλο, τζατζίκι και πατάτες",
      price: "€4.50",
      imageSrc: "/pita.png",
      imageAlt: "Πίτα Γύρος Μικτή",
    },
  ];

  const [amount, setAmount] = useState(50);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editableOrderItem, setEditableOrderItem] = useState<OrderItem | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    if (typeof window === "undefined") return []; // server
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
  const [quantity, setQuantity] = useState(editableOrderItem?.quantity || 1);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/createPayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          customerEmail: email
        }),
      });

      const data = await res.json();

      if (data.OrderCode) {
        // Αν είσαι σε sandbox
        window.location.href = `https://demo.vivapayments.com/web/checkout?ref=${data.OrderCode}`;

        // Για production
        // window.location.href = `https://www.vivapayments.com/web/checkout?ref=${data.OrderCode}`;
      } else {
        setError('Αποτυχία δημιουργίας πληρωμής');
      }
    } catch (err) {
      console.error(err);
      setError('Σφάλμα κατά την επικοινωνία με το server');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-white overflow-hidden">
      <Head>
        <title>Όνομα Σουβλατζίδικου | Αυθεντικά Ελληνικά Σουβλάκια</title>
        <meta name="description" content="Αυθεντικά ελληνικά σουβλάκια με παραδοσιακές γεύσεις" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Background Image */}
          <Image
            src={homepage}
            alt="Delicious Turkish kebabs"
            layout="fill"
            objectFit="cover"
            quality={90}
            priority
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Αυθεντικά Ελληνικά Σουβλάκια</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">Γεύση που θυμίζει Ελλάδα. Φτιαγμένα με φρέσκα υλικά και παράδοση.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link  href="/menu" className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-8 py-4 font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Δες το Μενού
            </Link>
            <a
              href="https://www.e-food.gr/"
              target="_blank"
              rel="noopener noreferrer" className="bg-transparent hover:bg-white border-2 border-white text-white hover:text-gray-900 px-8 py-4 font-bold text-lg transition-all duration-300"
            >
              Παράγγειλε Online
            </a>
          </div>
        </div>
      </section>

      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Πληρωμή με Viva Wallet</h1>

        <div className="mb-4 flex flex-col gap-2 w-full max-w-sm">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded p-2"
          />
          <input
            type="number"
            placeholder="Ποσό (€)"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="border rounded p-2"
          />
        </div>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          onClick={handlePayment}
          disabled={loading || !email || amount <= 0}
          className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Φόρτωση...' : 'Πλήρωσε τώρα'}
        </button>
      </div>

      {/* Menu Section */}
      <section id="menu" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Το Μενού Μας</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 p-6 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="h-48 mb-4 relative">
                  <Image
                    src={item.imageSrc}
                    alt={item.imageAlt}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{item.price}</span>
                  <button className="bg-gray-900 hover:bg-yellow-500 text-white hover:text-gray-900 px-4 py-2 font-bold transition-colors">
                    Προσθήκη
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-3 font-bold transition-colors inline-block"
            >
              Πλήρες Μενού
            </Link>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section 
        id="offers" 
        className="py-16 bg-gray-100 bg-cover bg-center"
        style={{
          backgroundImage: "url('/souvlakiBG2.jpg')",
          backgroundAttachment: "fixed", // παραμένει σταθερή όταν σκρολάρεις
          display: 'none',
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-100 mb-12">Προσφορές</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 p-8 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-yellow-500 flex items-center justify-center mr-4">
                      <span className="text-white font-bold">{offer.badge}</span>
                    </div>
                    <h3 className="text-xl font-bold">{offer.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{offer.description}</p>
                  <button className="text-yellow-600 hover:text-yellow-700 font-bold transition-colors">
                    Δες περισσότερα →
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>

      <RedSquareCarousel />

      {/* About Section */}
      <section id="about" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Η Ιστορία Μας</h2>
              <p className="text-gray-600 mb-4">
                Από το 1995, φτιάχνουμε αυθεντικά ελληνικά σουβλάκια με αγάπη και προσοχή στη λεπτομέρεια. 
                Χρησιμοποιούμε φρέσκα υλικά και παραδοσιακές τεχνικές για να σας προσφέρουμε γνήσια γεύση.
              </p>
              <p className="text-gray-600 mb-6">
                Η συνταγή μας παραμένει αμετάβλητη για δεκαετίες, διατηρώντας ζωντανή την παράδοση του ελληνικού σουβλακιού.
              </p>
              <Link href="/about" className="bg-gray-900 hover:bg-yellow-500 text-white hover:text-gray-900 px-6 py-3 font-bold transition-colors">
                Διαβάστε Περισσότερα
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-64 w-full">
                <Image
                  src="/photo1.jpg" // put your image in the public/images folder
                  alt="Φωτογραφία 1"
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="relative h-64 w-full">
                <Image
                  src="/photo2.jpg"
                  alt="Φωτογραφία 2"
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contact" 
        className="py-16 bg-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Επικοινωνία</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((card, i) => (
              <div
                key={i}
                ref={(el) => { cardsRef.current[i] = el; }}
                data-index={i}
                className={`bg-white p-6 text-center border border-gray-200 transition-all duration-700 transform ${
                  visible[i] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                } hover:shadow-lg`}
              >
                <div className="h-16 w-16 mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white">{card.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                {card.description.split("\n").map((line, idx) => (
                  <p key={idx} className="text-gray-600">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Footer */}
      <Footer />
    </div>
  );
}