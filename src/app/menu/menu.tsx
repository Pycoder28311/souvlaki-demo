"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import Footer from '../footer';
import EditModal from "./editModal";
import ProductModal from "./productModal";
import OrderSidebar from "../cart";
import Image from "next/image";
import { Search, X } from "lucide-react";
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
};

type ImageType = {
  id: number
  data: Uint8Array
  createdAt: Date
}

type Product = {
  id: number
  name: string
  price: number
  offer: boolean
  description: string;
  image?: ImageType | null
  imageId?: number | null; 
  ingCategories?: IngCategory[]
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

      const ingredientsTotal = selectedIngredients.reduce(
        (sum, ing) => sum + Number(ing.price),
        0
      );
      const totalPrice = product.price + ingredientsTotal;

      // Otherwise add new item with categories too
      return [
        ...prev,
        {
          imageId: product.imageId ?? null,
          productId: product.id,
          name: product.name,
          price: totalPrice,
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
              // Recalculate price: base price + sum of ingredient prices
              price:
                orderItemToEdit.price - 
                (item.selectedIngredients?.reduce((sum, ing) => sum + Number(ing.price), 0) || 0) + 
                newIngredients.reduce((sum, ing) => sum + Number(ing.price), 0),
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
    const name = prompt("Enter product name");
    if (!name) return;

    const description = prompt("Enter product description");
    if (!description) return;

    const priceStr = prompt("Enter product price");
    if (!priceStr) return;

    const price = parseFloat(priceStr);
    if (isNaN(price)) {
      alert("Price must be a number");
      return;
    }

    try {
      const res = await fetch("/api/create-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, categoryId, description }),
      });

      if (!res.ok) throw new Error("Failed to create product");

      // Refresh page to show the new product
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Error creating product");
    }
  };

  const handleCreateCategory = async () => {
    const name = prompt("Enter new category name");
    if (!name) return;

    try {
      const res = await fetch("/api/create-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to create category");
      // Refresh page to show the new category
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Error creating category");
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to delete product "${productName}"?`)) return;

    try {
      const res = await fetch(`/api/delete-product/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");

      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete category "${categoryName}"?`)) return;

    try {
      const res = await fetch(`/api/delete-category/${categoryId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete category");

      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Error deleting category");
    }
  };

  const handleEditCategory = async (categoryId: number, currentName: string) => {
    const newName = prompt("Enter new category name", currentName);
    if (!newName || newName === currentName) return;

    try {
      const res = await fetch(`/api/update-category/${categoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Failed to update category");
      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Error updating category");
    }
  };

  const handleEditProduct = async (productId: number, currentName: string) => {
    const newName = prompt("Enter new product name", currentName);
    if (!newName || newName === currentName) return;

    try {
      const res = await fetch(`/api/update-product/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) throw new Error("Failed to update product");

      window.location.reload(); 
    } catch (err) {
      console.error(err);
      alert("Error updating product");
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
      // Send an array of { id, position } to the backend
      const body = categories.map((c, index) => ({
        id: c.id,
        position: index + 1, // or use c.position if already updated
      }));

      const res = await fetch("/api/position-categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to save positions");

      alert("Positions saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving positions");
    }
  };

  const toggleProductOffer = async (productId: number, currentOffer: boolean) => {
    try {
      const res = await fetch(`/api/products-offer/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer: !currentOffer }), // toggle
      });

      if (!res.ok) throw new Error("Failed to toggle offer");

      alert(`Product offer is now ${!currentOffer ? "active" : "inactive"}!`);

      // Optionally update state instead of reloading
      // setProducts(prev => prev.map(p => p.id === productId ? { ...p, offer: !currentOffer } : p));

      window.location.reload(); // remove this if using state update above
    } catch (error) {
      console.error(error);
      alert("Failed to toggle offer");
    }
  };

  const setEditDescription = async (productId: number) => {
    const newDescription = prompt("Enter new product description");
    if (!newDescription) return;

    await fetch(`/api/products-description/${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDescription }),
    });
    alert("Description is updated!");
    window.location.reload();
    // refresh product list or revalidate
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
  }, [])

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

      <div className=" gap-4">
        {/* Main Content */}
        <div
          className={`transition-all duration-300`}
        >

            {/* Categories Buttons */}
            <section className="sticky z-30 py-4 border-b bg-white top-[50px] p-6">
              <div className="flex gap-2 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:justify-start items-center" ref={containerRef}>
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
              <div className=" w-screen bg-white z-50 flex justify-start p-2 shadow-md">
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
                      <div className="flex items-center gap-2">

                        {/* Move Up/Down */}
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveCategory(category.id, "up")}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition"
                            title="Move Up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveCategory(category.id, "down")}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 transition"
                            title="Move Down"
                          >
                            ↓
                          </button>
                        </div>

                        {/* Save Positions */}
                        <button
                          onClick={saveCategoryPositions}
                          className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Save Positions
                        </button>

                        {/* Action Icons */}
                        <div className="flex items-center gap-1">
                          {/* Create Product */}
                          <button
                            onClick={() => handleCreateProduct(category.id)}
                            className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                            title="Create Product"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>

                          {/* Edit Category */}
                          <button
                            onClick={() => handleEditCategory(category.id, category.name)}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                            title="Edit Category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 0v2m6 6l-6 6H5v-6l6-6h6z" />
                            </svg>
                          </button>

                          {/* Delete Category */}
                          <button
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            title="Delete Category"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`relative flex items-start justify-between border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer bg-white ${
                          email === "kopotitore@gmail.com" ? "h-44" : "h-28"
                        }`}
                        onClick={() => setSelectedProduct(product)}
                      >
                        {/* Product Info */}
                        <div className="flex-1 p-2 pr-12">
                          <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">{product.name}</h3>
                          {product.offer && (
                            <p className="text-sm text-red-500 font-semibold mb-2">Προσφορά!</p>
                          )}
                          <p className="font-bold text-yellow-600 text-lg mb-2">
                            ${product.price.toFixed(2)}
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
                          </div>
                        ) : (
                          <div className="w-28 h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-r-xl flex-shrink-0">
                            No Image
                          </div>
                        )}

                        {/* + Button (absolute positioned) */}
                        <button
                          className="absolute bottom-2 right-2 p-2 bg-yellow-400 text-gray-800 font-bold rounded-lg transition hover:bg-yellow-500 
                                    shadow-[2px_2px_0px_0px_rgba(202,138,4,0.5)]"
                        >
                          <Plus size={20} />
                        </button>

                        {/* Admin Buttons */}
                        {email === "kopotitore@gmail.com" && (
                          <div className="absolute bottom-2 flex gap-1 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product.id, product.name);
                              }}
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition text-sm font-medium"
                              title="Edit Product"
                            >
                              Edit Name
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product.id, product.name);
                              }}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
                              title="Delete Product"
                            >
                              Delete Product
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleProductOffer(product.id, product.offer);
                              }}
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-sm font-medium"
                              title="Toggle Offer"
                            >
                              {product.offer ? "Remove Offer" : "Set Offer"}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditDescription(product.id);
                              }}
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium"
                              title="Edit Description"
                            >
                              Edit Description
                            </button>
                          </div>
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
        <button
          onClick={handleCreateCategory}
          className="inline-block px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex-shrink-0"
        >
          + Create Category
        </button>
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