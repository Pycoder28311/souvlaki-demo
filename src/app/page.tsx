"use client";

import Head from 'next/head';
import Image from 'next/image';
import Link from "next/link";
import homepage from "../../public/homepage.jpg";
import { useEffect, useRef, useState } from "react";
import RedSquareCarousel from './z-components/carousel';
import MenuGrid from "./z-components/offers";
import { Product } from "./types"; 
import { useCart } from './wrappers/cartContext';
import { Pencil, X } from 'lucide-react';

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
  const { addToCart, showWelcome, user, setUser, address, setAddress, validRadius, setShowWelcome } = useCart();

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

    // Capture the current refs in a local variable
    const currentCards = cardsRef.current;
    currentCards.forEach((card) => card && observer.observe(card));

    return () => {
      currentCards.forEach((card) => card && observer.unobserve(card));
    };
  }, []); // empty dependency array is fine

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

  const [amount, setAmount] = useState(50);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [warning, setWarning] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [editingAddress, setEditingAddress] = useState(false);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.length < 3) {
      setResults([]); // clear results if query is empty
      return;
    }

    const res = await fetch(
      `/api/search-address?query=${encodeURIComponent(e.target.value)}`
    );
    const data = await res.json();
    setResults(data.suggestions || []);
  };

  const handleUpdateAddress = async () => {
    try {
      
      const addressToSend = results[0]?.trim() ? results[0] : address;

      if (!addressToSend || addressToSend.trim().length < 3 || !query) {
        setWarning("Παρακαλώ εισάγετε μια έγκυρη διεύθυνση.");
        return;
      }

      const payload = { address: addressToSend, email: user?.email };
      const response = await fetch("/api/update-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const data = await response.json();
      
      //setEditingAddress(false);
      setWarning("");
      setQuery("")
      setUser(data.updatedUser);
      setAddress(data.updatedUser.address)
      if (validRadius && data.distanceValue > validRadius) {
        setWarning("Η απόστασή σας από το κατάστημα υπερβαίνει την δυνατή απόσταση παραγγελίας.")
      } else {
        setWarning("Η διεύθυνσή σας αποθηκεύτηκε απιτυχώς");
        setEditingAddress(false); 
        setTimeout(() => {
          setWarning("");
          setShowWelcome(false)  
        }, 2000);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

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

  const handleConfirmAddress = () => {
    setWarning("")
    setAddress(query);      // ενημέρωσε την διεύθυνση
    //setEditingAddress(false); 
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <Head>
        <title>Όνομα Σουβλατζίδικου | Αυθεντικά Ελληνικά Σουβλάκια</title>
        <meta name="description" content="Αυθεντικά ελληνικά σουβλάκια με παραδοσιακές γεύσεις" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {showWelcome && user && (
          <div className="fixed top-20 left-0 bg-gray-100 p-3 rounded-r-xl shadow z-50 w-auto max-w-full">
            {editingAddress ? (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Πληκτρολογήστε τη διεύθυνσή σας..."
                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => {handleConfirmAddress(); handleUpdateAddress();}}
                    className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center"
                  >
                    <span className="hidden sm:block">Επεξεργασία</span>

                    {/* Icon σε μικρές οθόνες */}
                    <Pencil className="w-5 h-6 sm:hidden" />
                  </button>
                  <button
                    onClick={() => setEditingAddress(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition flex items-center justify-center"
                  >
                    <X className="w-5 h-6" />
                  </button>
                </div>

                {/* Dropdown Results */}
                {results.length > 0 && (
                  <ul className="absolute top-full left-0 bg-white border rounded-xl max-h-52 overflow-y-auto mt-1 shadow-lg z-20">
                    {results.map((r, i) => (
                      <li
                        key={i}
                        onClick={() => {
                          setAddress(r);
                          setQuery(r);
                          setResults([]);
                        }}
                        className="p-3 hover:bg-gray-100 cursor-pointer text-left"
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 max-w-full">
                <strong className="text-gray-500 text-lg truncate">{user.business ? "Είναι αυτή η διεύθυνσή της επιχείρησης;" : "Είναι αυτή η διεύθυνσή σας;"} </strong>
                <p className="text-gray-500 text-lg truncate">{user?.address}</p>
                <div className="flex flex-row items-center gap-4">
                  <button
                    onClick={() => {handleConfirmAddress(); setShowWelcome(false)}}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    Ναι
                  </button>
                  <button
                    onClick={() => setEditingAddress(true)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition flex-shrink-0"
                  >
                    Όχι, επεξεργασία
                  </button>
                </div>
              </div>

            )}

            {warning && (
              <div className="flex-wrap max-w-80 text-red-600 font-semibold mt-4 mb-4">
                {warning}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Background Image */}
          <Image
            src={homepage}
            alt="Ελληνικά σουβλάκια"
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
            <Link  href="/menu" className="bg-yellow-500 rounded-lg hover:bg-yellow-600 text-gray-900 px-8 py-4 font-bold text-lg transition-all duration-300 transform hover:scale-105">
              Δες το Μενού
            </Link>
          </div>
        </div>
      </section>

      <div className="hidden min-h-screen flex flex-col items-center justify-center p-4">
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
          
          <MenuGrid addToCart={addToCart} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}/>

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
                    <div className="h-12 w-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
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
              <Link href="/about" className="bg-gray-900 hover:bg-yellow-500 rounded-lg text-white hover:text-gray-900 px-6 py-3 font-bold transition-colors">
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
                <h3 className="text-xl font-bold mb-2 text-gray-700">{card.title}</h3>
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
    </div>
  );
}