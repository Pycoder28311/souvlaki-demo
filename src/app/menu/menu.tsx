"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import Footer from '../footer';
import EditModal from "./editModal";
import ProductModal from "./productModal";
import OrderSidebar from "../cart";
import Image from "next/image";
import { Search, X, Edit2, Trash2 } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { Plus } from "lucide-react";

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
  isRequired?: boolean;
};

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
  offerPrice?: number;
  description: string;
  image?: ImageType | null
  imageId?: number | null; 
  ingCategories?: IngCategory[];
  options?: Option[];
}

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
  imageId: number | null;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
  selectedOptions?: Option[];
  options?: Option[];
};

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

export default function Menu({ categories: initialCategories, email }: { categories: Category[], email?: string }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories); // <-- new state
  const [activeCategory, setActiveCategory] = useState<number>(initialCategories[0]?.id || 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(categories.length);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // default safe for server

  const [isClient, setIsClient] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

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

  const visibleCategories = categories.slice(0, visibleCount);
  const hiddenCategories = categories.slice(visibleCount);

  const isMobile = useIsMobile();

  useEffect(() => {
    // Set initial value on client
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    handleResize(); // set immediately on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
  }, []);
  const [editableOrderItem, setEditableOrderItem] = useState<OrderItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // for viewing details
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
  const categoryRefs = useRef<Record<number, HTMLElement | null>>({});
  const [quantity, setQuantity] = useState(editableOrderItem?.quantity || 1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const addToCart = (
    product: Product,
    selectedIngredients: Ingredient[],
    selectedIngCategories: IngCategory[], // categories
    selectedOptions: Option[], // 👈 options
    options: Option[]
  ) => {
    setOrderItems((prev) => {
      // Check if product with same ingredients and options already exists
      const existing = prev.find((item) => {
        if (item.productId !== product.id) return false;

        const itemIngredients = item.selectedIngredients || [];
        if (itemIngredients.length !== selectedIngredients.length) return false;
        const ingredientsMatch = itemIngredients.every((ing) =>
          selectedIngredients.some((sel) => sel.id === ing.id)
        );

        const itemOptions = item.selectedOptions || [];
        if (itemOptions.length !== selectedOptions.length) return false;
        const optionsMatch = itemOptions.every((opt) =>
          selectedOptions.some((sel) => sel.id === opt.id)
        );

        return ingredientsMatch && optionsMatch;
      });

      if (existing) {
        return prev.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const ingredientsTotal = selectedIngredients.reduce(
        (sum, ing) => sum + Number(ing.price),
        0
      );
      const optionsTotal = selectedOptions.reduce(
        (sum, opt) => sum + Number(opt.price),
        0
      );

      const totalPrice = product.price + ingredientsTotal + optionsTotal;

      return [
        ...prev,
        {
          imageId: product.imageId ?? null,
          productId: product.id,
          name: product.name,
          price: totalPrice,
          quantity: 1,
          selectedIngredients,
          selectedIngCategories,
          selectedOptions, // 👈 store Option[] here
          options,
        },
      ];
    });

    setSelectedProduct(null);
  };

  const editItem = (
    orderItemToEdit: OrderItem,
    newIngredients: Ingredient[],
    selectedOptions?: Option[] | undefined, // εδώ χρησιμοποιούμε τον τύπο SelectedOption { id, value: "yes" | "no" }
  ) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item === orderItemToEdit
          ? {
              ...item,
              quantity: quantity,
              selectedIngredients: newIngredients,
              selectedOptions: selectedOptions, // προσθήκη options
              // Recalculate price: base price + sum of ingredient prices
              price:
              orderItemToEdit.price
              - (item.selectedIngredients?.reduce((sum, ing) => sum + Number(ing.price), 0) || 0)
              + newIngredients.reduce((sum, ing) => sum + Number(ing.price), 0)
              - (item.selectedOptions?.reduce((sum, opt) => sum + Number(opt.price), 0) || 0)
              + (selectedOptions?.reduce((sum, opt) => sum + Number(opt.price), 0) || 0),
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

  const removeItem = (item: OrderItem) => {
    setOrderItems((prev) => {
      const updated = prev.filter((itm) => itm !== item);

      // Optional: immediately update localStorage (redundant if you already have the useEffect)
      localStorage.setItem("orderItems", JSON.stringify(updated));

      return updated;
    });
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
    const newDescription = prompt("Εισάγετε τη νέα περιγραφή του προϊόντος");
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

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (isSidebarOpen && isMobile) {
      // Disable background scroll
      document.body.style.overflow = "hidden";
    } else {
      // Re-enable when closed
      document.body.style.overflow = "";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSidebarOpen, isMobile]);

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const [selectedAdminProduct, setSelectedAdminProduct] = useState<Product | null>(null);
  const modalProdRef = useRef<HTMLDivElement>(null);

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
              className="flex flex-col space-y-12 mt-6 p-6 transition-transform duration-300 ease-in-out w-full lg:w-[70%]"
              style={{
                transform:
                  isSidebarOpen || (isClient && screenWidth < 1024) // mobile & tablet (lg breakpoint)
                    ? "translateX(0)"
                    : "translateX(20%)",
              }}
            >
              {categories.map((category) => {
                const filteredProducts = category.products.filter((product) =>
                  product.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                return (
                  <section
                    key={category.id}
                    ref={(el) => {
                      categoryRefs.current[category.id] = el;
                    }}
                  >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{category.name}</h2>

                    {email === "kopotitore@gmail.com" && (
                      <button
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory?.id === category.id ? null : category
                          )
                        }
                        className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                        title="Επεξεργασία Κατηγορίας"
                      >
                        <Edit2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="relative flex items-start justify-between border border-gray-200 rounded-xl h-28 shadow-sm hover:shadow-lg transition-all cursor-pointer bg-white"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {/* Product Info */}
                        <div className="flex-1 p-2 pr-12">
                          <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{product.name}</h3>

                          {product.offer && (
                            <p className="text-sm text-red-500 font-semibold mb-1">Προσφορά!</p>
                          )}

                          <p className="font-bold text-yellow-600 text-lg mb-2 flex items-center gap-2">
                            {product.offer ? (
                              <>
                                <span>{(product.price).toFixed(2)}€</span>
                                <span className="line-through text-gray-400">{product.offerPrice?.toFixed(2)}€</span>
                              </>
                            ) : (
                              <span>{product.price.toFixed(2)}€</span>
                            )}
                          </p>
                        </div>

                        {/* Product Image */}
                        {product.imageId ? (
                          <div className={`w-28 relative rounded-r-xl overflow-hidden border border-yellow-400 flex-shrink-0 ${email === "kopotitore@gmail.com" ? "h-28" : "h-full"
                          }`}>
                            <Image
                              src={`/api/images/${product.imageId}`}
                              alt={product.name}
                              fill
                              style={{ objectFit: "cover" }}
                            />

                            {/* + Button (absolute positioned) */}
                            <button
                              className="absolute bottom-2 right-2 p-2 bg-yellow-400 text-gray-800 font-bold rounded-lg transition hover:bg-yellow-500 
                                        shadow-[2px_2px_0px_0px_rgba(202,138,4,0.5)]"
                            >
                              <Plus size={20} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-28 h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-r-xl flex-shrink-0">
                            Χωρίς Εικόνα
                          </div>
                        )}
                        {email === "kopotitore@gmail.com" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAdminProduct(
                                selectedAdminProduct?.id === product.id ? null : product
                              )
                            }}
                            className="absolute top-2 right-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                            title="Επεξεργασία Προϊόντος"
                          >
                            <Edit2 size={20} /> {/* You can replace with Edit2 icon from lucide-react */}
                          </button>
                        )}

                      </div>
                    ))}
                  </div>
                </section>
                )})}
            </div>
        </div>
      </div>

      {email === "kopotitore@gmail.com" && (
        <div className="w-100 flex justify-center mt-4 mb-4">
          <button
            onClick={handleCreateCategory}
            className="rounded-lg px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            + Δημιουργία Κατηγορίας
          </button>
        </div>
      )}

      {email === "kopotitore@gmail.com" && selectedCategory && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-2xl shadow-xl w-[90%] sm:w-[500px] relative"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
            >
              <X size={22} />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center">
              Επεξεργασία Κατηγορίας: {selectedCategory.name}
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => moveCategory(selectedCategory.id, "up")}
                  className="px-4 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-transform transform hover:scale-110"
                >
                  ▲ Πάνω
                </button>
                <button
                  onClick={() => moveCategory(selectedCategory.id, "down")}
                  className="px-4 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-transform transform hover:scale-110"
                >
                  ▼ Κάτω
                </button>
              </div>

              <button
                onClick={saveCategoryPositions}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 font-medium"
              >
                Ενημέρωση Θέσεων
              </button>

              <button
                onClick={() => handleCreateProduct(selectedCategory.id)}
                className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 font-medium"
              >
                <Plus size={18} className="inline mr-2" />
                Δημιουργία Προϊόντος
              </button>

              <button
                onClick={() =>
                  handleEditCategory(
                    selectedCategory.id,
                    selectedCategory.name
                  )
                }
                className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-transform transform hover:scale-105 font-medium"
              >
                <Edit2 size={18} className="inline mr-2" />
                Επεξεργασία Ονόματος
              </button>

              <button
                onClick={() =>
                  handleDeleteCategory(
                    selectedCategory.id,
                    selectedCategory.name
                  )
                }
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105 font-medium"
              >
                <Trash2 size={18} className="inline mr-2" />
                Διαγραφή Κατηγορίας
              </button>
            </div>
          </div>
        </div>
      )}

      {email === "kopotitore@gmail.com" && selectedAdminProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
          <div
            ref={modalProdRef}
            className="bg-white p-6 rounded-2xl shadow-xl w-[90%] sm:w-[400px] relative"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedAdminProduct(null)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
            >
              ✕
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center">
              Ενέργειες Προϊόντος: {selectedAdminProduct.name}
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleEditProduct(selectedAdminProduct.id, selectedAdminProduct.name)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
              >
                Επεξεργασία Ονόματος
              </button>

              <button
                onClick={() => handleDeleteProduct(selectedAdminProduct.id, selectedAdminProduct.name)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Διαγραφή Προϊόντος
              </button>

              <button
                onClick={() => toggleProductOffer(selectedAdminProduct.id, selectedAdminProduct.offer, selectedAdminProduct.price)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                {selectedAdminProduct.offer ? "Αφαίρεση Προσφοράς" : "Ορισμός Προσφοράς"}
              </button>

              <button
                onClick={() => setEditDescription(selectedAdminProduct.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Επεξεργασία Περιγραφής
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          email={email}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          addToCart={addToCart}
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
          className="hidden md:flex fixed right-0 top-[90px] -translate-y-1/2 px-3 py-2 bg-green-600 text-white rounded-l z-40 items-center justify-center"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Cart"
        >
          <ShoppingCart className="w-8 h-8" />
        </button>
      )}

      {!isSidebarOpen && (
        <button
          className="
            block md:hidden
            fixed bottom-4 left-4 right-4 w-auto px-6 py-3 bg-green-600 text-white flex items-center justify-center rounded-lg z-40
            text-lg font-semibold shadow-lg hover:bg-green-700 active:bg-green-800 transition-colors duration-200
          "
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Cart"
        >
          <ShoppingCart className="w-8 h-8 mr-2" /> Καλάθι
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