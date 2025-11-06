"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import ProductModal from "./productModal";
import { useCart } from "../wrappers/cartContext";
import { Search, X} from "lucide-react";
import { Product, Category } from "../types";
import AdminProductModal from "./components/adminProductModal";
import AdminCategoryModal from "./components/adminCategoryModal";
import CategorySection from "./components/categorySection";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Menu({ categories: initialCategories, business }: { categories: Category[], email?: string, business?: boolean }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories); // <-- new state
  const [activeCategory, setActiveCategory] = useState<number>(initialCategories[0]?.id || 0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(categories.length);

  const [isClient, setIsClient] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const { addToCart, isSidebarOpen, setIsSidebarOpen, user } = useCart();
  const visibleCategories = categories.slice(0, visibleCount);
  const hiddenCategories = categories.slice(visibleCount);
  const isMobile = useIsMobile();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // for viewing details
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedAdminProduct, setSelectedAdminProduct] = useState<Product | null>(null);
  const modalProdRef = useRef<HTMLDivElement>(null);

  const distance = user?.distanceToDestination ?? 0; // σε km
  const deliverySpeedKmPerMin = 30 / 60; // 30 km/h σε λεπτά ανά km
  const travelTime = distance / deliverySpeedKmPerMin + 10; // +10 λεπτά προετοιμασίας

  // Στρογγυλοποίηση στο πλησιέστερο 5
  const roundTo5 = (num: number) => Math.ceil(num / 5) * 5;

  // Δημιουργία εύρους 5 λεπτών
  const lower = roundTo5(travelTime);
  const upper = lower + 5;

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => setScreenWidth(window.innerWidth);

    // Initialize
    handleResize();

    // Listen for resizes
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (!containerRef.current) return;

      // Use full width if sidebar is open, otherwise 60% width
      const containerWidth = isSidebarOpen
        ? (5 * containerRef.current.offsetWidth) / 10
        : containerRef.current.offsetWidth;

      let totalWidth = 0;
      let count = 0;

      const buttons = containerRef.current.children;
      for (let i = 0; i < buttons.length; i++) {
        const buttonWidth = (buttons[i] as HTMLElement).offsetWidth + 16; // add margin
        if (totalWidth + buttonWidth > containerWidth) break;
        totalWidth += buttonWidth;
        count++;
      }
      setVisibleCount(count);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [categories, isSidebarOpen]); // add sidebarOpen to deps

  useEffect(() => {
    // Set initial value on client
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize(); // set immediately on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  useEffect(() => {
    // If user.business changes dynamically, close the sidebar
    if (user?.business) {
      setIsSidebarOpen(false);
    }
  }, [user?.business, setIsSidebarOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, []);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setSelectedCategory(null);
      }
    }

    if (selectedCategory) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedCategory]);

  // Close modal on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalProdRef.current &&
        !modalProdRef.current.contains(event.target as Node)
      ) {
        setSelectedAdminProduct(null);
      }
    }

    if (selectedAdminProduct) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedAdminProduct]);

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

  const handleCreateProduct = async (categoryId: number) => {
    const name = prompt("Εισάγετε το όνομα του προϊόντος");
    if (!name) return;

    const description = prompt("Εισάγετε την περιγραφή του προϊόντος");
    if (!description) return;

    const priceStr = prompt("Εισάγετε την τιμή του προϊόντος");
    if (!priceStr) return;

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      alert("Η τιμή πρέπει να είναι αριθμός");
      return;
    }

    try {
      const res = await fetch("/api/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, categoryId, description }),
      });

      if (!res.ok) throw new Error("Απέτυχε η δημιουργία του προϊόντος");

      // Ανανέωση της σελίδας για να εμφανιστεί το νέο προϊόν
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη δημιουργία του προϊόντος");
    }
  };

  const handleCreateCategory = async () => {
    const name = prompt("Εισάγετε το όνομα της νέας κατηγορίας");
    if (!name) return;

    try {
      const res = await fetch("/api/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Απέτυχε η δημιουργία της κατηγορίας");

      // Ανανέωση της σελίδας για να εμφανιστεί η νέα κατηγορία
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη δημιουργία της κατηγορίας");
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "${productName}"?`)) return;

    try {
      const res = await fetch(`/api/delete-product/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Απέτυχε η διαγραφή του προϊόντος");

      // Ανανέωση της σελίδας για να ενημερωθεί η λίστα προϊόντων
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη διαγραφή του προϊόντος");
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "${categoryName}"?`)) return;

    try {
      const res = await fetch(`/api/delete-category/${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Απέτυχε η διαγραφή της κατηγορίας");

      // Ανανέωση της σελίδας για να ενημερωθεί η λίστα κατηγοριών
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη διαγραφή της κατηγορίας");
    }
  };

  const handleEditCategory = async (categoryId: number, currentName: string) => {
    const newName = prompt("Εισάγετε το νέο όνομα της κατηγορίας", currentName);
    if (!newName || newName === currentName) return;

    try {
      const res = await fetch(`/api/update-category/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Απέτυχε η ενημέρωση της κατηγορίας");

      // Ανανέωση της σελίδας για να εμφανιστεί το νέο όνομα
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την ενημέρωση της κατηγορίας");
    }
  };

  const handleEditProduct = async (productId: number, currentName: string) => {
    const newName = prompt("Εισάγετε το νέο όνομα του προϊόντος", currentName);
    if (!newName || newName === currentName) return;

    try {
      const res = await fetch(`/api/update-product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Απέτυχε η ενημέρωση του προϊόντος");

      // Ανανέωση της σελίδας για να εμφανιστεί το νέο όνομα
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την ενημέρωση του προϊόντος");
    }
  };

  function moveCategory(categoryId: number, direction: "up" | "down") {
    setCategories((prevCategories) => {
      // Clone the array
      const categoriesCopy = [...prevCategories];

      // Find index of category to move
      const index = categoriesCopy.findIndex((c) => c.id === categoryId);
      if (index === -1) return categoriesCopy;

      // Determine new index
      const newIndex = direction === "up" ? index - 1 : index + 1;

      // Prevent going out of bounds
      if (newIndex < 0 || newIndex >= categoriesCopy.length) return categoriesCopy;

      // Swap positions
      const temp = categoriesCopy[newIndex];
      categoriesCopy[newIndex] = categoriesCopy[index];
      categoriesCopy[index] = temp;

      return categoriesCopy;
    });
  }

  const saveCategoryPositions = async () => {
    try {
      // Στέλνουμε έναν πίνακα { id, position } στο backend
      const body = categories.map((c, index) => ({
        id: c.id,
        position: index + 1, // ή χρησιμοποιήστε c.position αν έχει ήδη ενημερωθεί
      }));

      const res = await fetch("/api/position-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Απέτυχε η αποθήκευση των θέσεων");

      alert("Οι θέσεις αποθηκεύτηκαν επιτυχώς!");
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την αποθήκευση των θέσεων");
    }
  };

  const toggleProductOffer = async (productId: number, currentOffer: boolean, price: number, currentOfferPrice?: number) => {
    try {
      let offerPrice = currentOfferPrice || 0;

      // Αν η προσφορά ενεργοποιείται, ρώτα τον χρήστη για την τιμή προσφοράς
      if (!currentOffer) {
        const newPriceStr = prompt("Υποβολή νέας τιμής", offerPrice.toString());
        if (!newPriceStr) return;
        const newPrice = parseFloat(newPriceStr);
        if (isNaN(newPrice)) return alert("Η τιμή προσφοράς πρέπει να είναι αριθμός");
        offerPrice = newPrice;
      } else {
        // Αν απενεργοποιείται, μηδενίζουμε ή αφήνουμε τιμή
        offerPrice = 0;
      }

      const res = await fetch(`/api/products-offer/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: !currentOffer, offerPrice, price }),
      });

      if (!res.ok) throw new Error("Απέτυχε η αλλαγή της προσφοράς");

      alert(`Η προσφορά του προϊόντος είναι πλέον ${!currentOffer ? "ενεργή" : "ανενεργή"}!`);

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Απέτυχε η αλλαγή της προσφοράς");
    }
  };

  const setEditDescription = async (productId: number) => {
    const newDescription = prompt("Εισάγετε τη νέα περιγραφή του προϊόντος", selectedAdminProduct?.description);
    if (!newDescription) return;

    await fetch(`/api/products-description/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDescription }),
    });

    alert("Η περιγραφή ενημερώθηκε!");
    window.location.reload();
    // Ανανεώστε τη λίστα προϊόντων ή κάντε revalidate
  };

  const setEditPrice = async (productId: number) => {
    const newPrice = prompt("Εισάγετε τη νέα τιμή του προϊόντος", selectedAdminProduct?.price.toString());
    if (!newPrice) return;

    await fetch(`/api/products-price/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: Number(newPrice) }),
    });

    alert("Η τιμή ενημερώθηκε!");
    window.location.reload();
    // Ανανεώστε τη λίστα προϊόντων ή κάντε revalidate
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
          <h1 className="text-4xl font-bold text-gray-100 mb-4">Μενού</h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            Από το 1985, δημιουργούμε αυθεντικά ελληνικά σουβλάκια με πάθος και αγάπη για την παραδοσιακή γεύση
          </p>
        </div>
      </section>

      <div className=" gap-4">
        {/* Main Content */}
        <div
          className={`transition-all duration-300`}
        >

            {/* Categories Buttons */}
            <section className="sticky z-30 py-4 border-b bg-white top-[50px] p-6">
              <div className={`flex gap-2 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:justify-start items-center 
                transition-all duration-300 ease-in-out
                ${(categories.length <= 4 && !isMobile) ? (isSidebarOpen ? "ml-0" : "ml-40") : ""}`} ref={containerRef}>
                {(isMobile ? categories : visibleCategories).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`inline-block px-4 py-2 font-bold transition-all flex-shrink-0 mx-2 rounded-lg ${
                      activeCategory === cat.id
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}

                {/* Περισσότερα dropdown - only on md+ */}
                {hiddenCategories.length > 0 && !isMobile && (
                  <div className="relative hidden md:inline-block">
                    <button
                      onClick={() => setDropdownOpen((prev) => !prev)}
                      className="ml-2 px-4 py-2 font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
                    >
                      Περισσότερα ▼
                    </button>
                    {dropdownOpen && (
                      <div className="absolute mt-1 bg-white border rounded shadow-lg min-w-[150px] z-50">
                        {hiddenCategories.map((cat: Category) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              handleCategoryClick(cat.id)
                              setDropdownOpen(false)
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="absolute mt-1 bg-white border rounded shadow-lg min-w-[150px] z-50 hidden group-hover:block md:group-hover:block">
                      {categories.slice(5).map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.id)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search toggle */}
                <button
                  onClick={() => setShowSearch((prev) => !prev)}
                  className="ml-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  {showSearch ? <X className="w-6 h-6 text-gray-600" /> : <Search className="w-6 h-6 text-gray-600" />}
                </button>
              </div>
            </section>

            {showSearch && (
              <div className=" w-full bg-white z-50 flex justify-start p-2 shadow-md">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-1/2 px-4 py-2 border rounded focus:outline-none focus:ring focus:border-gray-300"
                  autoFocus
                />
              </div>
            )}

            {/* Categories & Products */}
            <div
              className="flex flex-col space-y-12 mt-0 p-6 transition-transform duration-300 ease-in-out w-full lg:w-[70%]"
              style={{
                transform:
                  isSidebarOpen || (isClient && screenWidth < 1024) // mobile & tablet (lg breakpoint)
                    ? "translateX(0)"
                    : "translateX(20%)",
              }}
            >
              <p className="text-lg font-semibold text-yellow-500 mb-4">
                Χρόνος παράδοσης: {lower}-{upper} λεπτά
              </p>
              {categories.map((category) => {
                const filteredProducts = category.products.filter((product) =>
                  product.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    products={filteredProducts.filter(p => p.categoryId === category.id)}
                    business={business}
                    categoryRefs={categoryRefs}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    setSelectedProduct={setSelectedProduct}
                    selectedAdminProduct={selectedAdminProduct}
                    setSelectedAdminProduct={setSelectedAdminProduct}
                  />
                )})}
            </div>
        </div>
      </div>

      {business && (
        <div className="w-full flex justify-center mt-4 mb-4">
          <button
            onClick={handleCreateCategory}
            className="rounded-lg px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            + Δημιουργία Κατηγορίας
          </button>
        </div>
      )}

      {business && selectedCategory && (
        <AdminCategoryModal
          category={selectedCategory}
          modalRef={modalRef}
          onClose={() => setSelectedCategory(null)}
          moveCategory={moveCategory}
          saveCategoryPositions={saveCategoryPositions}
          handleCreateProduct={handleCreateProduct}
          handleEditCategory={handleEditCategory}
          handleDeleteCategory={handleDeleteCategory}
        />
      )}

      {business && selectedAdminProduct && (
        <AdminProductModal
          product={selectedAdminProduct}
          modalRef={modalProdRef}
          onClose={() => setSelectedAdminProduct(null)}
          onEditName={handleEditProduct}
          onDelete={handleDeleteProduct}
          onToggleOffer={toggleProductOffer}
          onEditDescription={setEditDescription}
          onEditPrice={setEditPrice}
        />
      )}

      {selectedProduct && (
        <ProductModal
          business={business}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
        />
      )}
    </div>
  );
}