"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import ProductModal from "./productModal";
import { useCart } from "../wrappers/cartContext";
import { Plus, Search, X } from "lucide-react";
import { Product, Category } from "../types";
import AdminProductModal from "./components/adminProductModal";
import AdminCategoryModal from "./components/adminCategoryModal";
import CategorySection from "./components/categorySection";
import { FormEvent } from "react";

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

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null);
  const [confirmingDeleteProduct, setConfirmingDeleteProduct] = useState<number | null>(null);

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
  if (user?.business) return;
    // Set initial value on client
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize(); // set immediately on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen, user?.business]);

  useEffect(() => {
    if (user?.business) return;
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen, user?.business]);

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

  const handleCreateProduct = async (categoryId: number, name: string, description: string, price: number) => {
    if (!name || !description || !price) {
      alert("Συμπληρώστε όλα τα πεδία!");
      return;
    }

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
      const newProduct = await res.json();
      setCategories((prevCategories) =>
        prevCategories.map((cat) => {
          if (cat.id === categoryId) {
            return {
              ...cat,
              products: [...cat.products, newProduct],
            };
          }
          return cat;
        })
      );

    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη δημιουργία του προϊόντος");
    }
  };

  const handleCreateCategory = async () => {
    if (!name.trim()) {
      alert("Συμπληρώστε το όνομα της κατηγορίας!");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Απέτυχε η δημιουργία της κατηγορίας");

      const newCategory = await res.json(); // assuming API returns created category

      // Update frontend state
      setCategories((prev) => [...prev, newCategory]);

      // Reset form
      setName("");
      setIsCreating(false);
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη δημιουργία της κατηγορίας");
    }
  };

  const handleDeleteProduct = async (productId: number, categoryId: number) => {

    try {
      const res = await fetch(`/api/delete-product/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Απέτυχε η διαγραφή του προϊόντος");

      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                products: cat.products.filter((prod) => prod.id !== productId),
              }
            : cat
        )
      );

      setSelectedAdminProduct(null)

    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη διαγραφή του προϊόντος");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {

    try {
      const res = await fetch(`/api/delete-category/${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Απέτυχε η διαγραφή της κατηγορίας");

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryId)
      );
      setSelectedCategory(null)
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά τη διαγραφή της κατηγορίας");
    }
  };

  const handleEditCategory = async (categoryId: number, newName: string) => {

    try {
      const res = await fetch(`/api/update-category/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Απέτυχε η ενημέρωση της κατηγορίας");
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, name: newName } : cat
        )
      );

    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την ενημέρωση της κατηγορίας");
    }
  };

  const handleEditProduct = async (productId: number, categoryId: number, newName: string) => {

    try {
      const res = await fetch(`/api/update-product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Απέτυχε η ενημέρωση του προϊόντος");
      const updatedProduct: Product = await res.json();

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                products: cat.products.map((prod) =>
                  prod.id === productId ? { ...prod, ...updatedProduct } : prod
                ),
              }
            : cat
        )
      );

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

      //alert("Οι θέσεις αποθηκεύτηκαν επιτυχώς!");
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την αποθήκευση των θέσεων");
    }
  };

  const toggleProductOffer = async (productId: number, categoryId: number, currentOffer: boolean, price: number, newOfferPrice: number, currentOfferPrice?: number) => {
    try {
      let offerPrice = currentOfferPrice || 0;

      // Αν η προσφορά ενεργοποιείται, ρώτα τον χρήστη για την τιμή προσφοράς
      if (!currentOffer) {
        offerPrice = newOfferPrice;
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

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                products: cat.products.map((prod) =>
                  prod.id === productId
                    ? {
                        ...prod,
                        offer: !currentOffer,
                        price: !currentOffer ? offerPrice : prod.price,
                        offerPrice: prod.price,
                      }
                    : prod
                ),
              }
            : cat
        )
      );

    } catch (error) {
      console.error(error);
      alert("Απέτυχε η αλλαγή της προσφοράς");
    }
  };

  const setEditDescription = async (productId: number, newDescription: string) => {
    try {
      const res = await fetch(`/api/products-description/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: newDescription }),
      });

      if (!res.ok) throw new Error("Απέτυχε η ενημέρωση του προϊόντος");

    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την ενημέρωση του προϊόντος");
    }
  };

  const setEditPrice = async (productId: number,  newPrice: number) => {
    try {
      const res = await fetch(`/api/products-price/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: Number(newPrice) }),
      });

      if (!res.ok) throw new Error("Απέτυχε η ενημέρωση της τιμής");

      // Assume API returns the updated product
      const updatedProduct: Product = await res.json();

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === updatedProduct.categoryId
            ? {
                ...cat,
                products: cat.products.map((prod) =>
                  prod.id === productId ? { ...prod, ...updatedProduct } : prod
                ),
              }
            : cat
        )
      );

    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την ενημέρωση της τιμής");
    }
  };

  // Function defined outside JSX
  const toggleCategoryAvailability = async (categoryId: number) => {
    try {
      // Toggle availability on backend
      const res = await fetch(`/api/availability-categories/${categoryId}`, {
        method: 'PUT',
      });
      if (!res.ok) throw new Error('Failed to toggle availability');

      // Update frontend state
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId ? { ...cat, alwaysClosed: !cat.alwaysClosed } : cat
        )
      );
    } catch (err) {
      console.error(err);
      alert('Σφάλμα κατά την αλλαγή της διαθεσιμότητας');
    }
  };

  const handleSubmit = async (
    e: FormEvent,
    openHour: string,
    openMin: string,
    closeHour: string,
    closeMin: string,
    setIsSaving: (isSaving: boolean) => void,
    category: Category
  ) => {
    e.preventDefault()

    const open = `${openHour}:${openMin}`
    const close = `${closeHour}:${closeMin}`

    // simple validation: open < close? (optional)
    const openT = parseInt(openHour) * 60 + parseInt(openMin)
    const closeT = parseInt(closeHour) * 60 + parseInt(closeMin)
    if (openT >= closeT) {
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/update-category-hours/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open, close }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Σφάλμα στο API')
      }
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === category.id ? { ...cat, openHour: open, closeHour: close } : cat
        )
      );
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleProductAvailability = async (productId: number, categoryId: number) => {
    try {
      // Toggle availability on backend
      const res = await fetch(`/api/availability-products/${productId}`, {
        method: "PUT",
      });
      if (!res.ok) throw new Error("Failed to toggle availability");

      // Assume API returns the updated product
      const data = await res.json();

      // Update frontend state
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                products: cat.products.map((prod) =>
                  prod.id === productId ? { ...prod, ...data.product } : prod
                ),
              }
            : cat
        )
      );
    } catch (err) {
      console.error(err);
      alert("Σφάλμα κατά την αλλαγή της διαθεσιμότητας");
    }
  };
  
  const handleSubmitProduct = async (
    e: FormEvent,
    openHour: string,
    openMin: string,
    closeHour: string,
    closeMin: string,
    setIsSaving: (isSaving: boolean) => void,
    product: Product,
    categoryId: number
  ) => {
    e.preventDefault()

    const open = `${openHour}:${openMin}`
    const close = `${closeHour}:${closeMin}`

    // simple validation: open < close? (optional)
    const openT = parseInt(openHour) * 60 + parseInt(openMin)
    const closeT = parseInt(closeHour) * 60 + parseInt(closeMin)
    if (openT >= closeT) {
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/update-product-hours/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open, close }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Σφάλμα στο API')
      }
      const data = await res.json();

      // Update categories state
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                products: cat.products.map((p) =>
                  p.id === product.id ? { ...p, ...data.product } : p
                ),
              }
            : cat
        )
      );
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

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
            <section className="sticky z-30 py-3 border-b bg-white top-[55px] p-4">
              <div className={`flex gap-2 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:justify-start items-center 
                transition-all duration-300 ease-in-out
                ${(categories.length <= 4 && !isMobile) ? (isSidebarOpen ? "ml-0" : "ml-40") : ""}`} ref={containerRef}>
                {(isMobile ? categories : visibleCategories).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`inline-block px-4 py-2 font-bold transition-all flex-shrink-0 mx-0 mr-2 md:mx-2 md:mr-0 rounded-lg ${
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
                  className="ml-2 md:ml-0 p-2 rounded-lg hover:bg-gray-100"
                >
                  {showSearch ? <X className="w-6 h-6 text-gray-600" /> : <Search className="w-6 h-6 text-gray-600" />}
                </button>
              </div>
            </section>

            {showSearch && (
              <div className="w-full bg-white z-50 flex justify-start p-2 shadow-md">
                <input
                  type="text"
                  placeholder="Αναζήτηση..."
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
              {!user?.business && (
                <p className="text-lg font-semibold text-yellow-500 mb-4">
                  Χρόνος παράδοσης: {lower}-{upper} λεπτά
                </p>
              )}
              {categories.map((category) => {
                const filteredProducts = (category.products || []).filter((product) =>
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
        <div className="w-full flex flex-col items-center mt-4 mb-4 gap-2">
          {isCreating ? (
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center px-6">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Όνομα νέας κατηγορίας"
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full md:w-64 text-xl sm:text-base"
              />

              <div className="flex flex-row sm:flex-row gap-2">
                <button
                  onClick={handleCreateCategory}
                  disabled={isSaving}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-all text-lg sm:text-base"
                >
                  Προσθήκη <Plus size={20} />
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setName("");
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-black rounded-lg px-4 py-2 flex items-center gap-2 transition-all text-lg sm:text-base"
                >
                  Ακύρωση <X size={20} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="rounded-lg px-4 py-2 font-bold text-white flex items-center gap-2 text-lg bg-blue-500 hover:bg-blue-600 transition-all"
            >
              Δημιουργία Κατηγορίας <Plus size={18} />
            </button>
          )}
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
          toggleCategoryAvailability={toggleCategoryAvailability}
          handleSubmit={handleSubmit}
          confirmingDelete={confirmingDelete}
          setConfirmingDelete={setConfirmingDelete}
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
          toggleProductAvailability={toggleProductAvailability}
          handleSubmit={handleSubmitProduct}
          confirmingDelete={confirmingDeleteProduct}
          setConfirmingDelete={setConfirmingDeleteProduct}
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