"use client";

import { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import Footer from '../footer';
import EditModal from "./editModal";
import ProductModal from "./productModal";
import OrderSidebar from "../cart";
import Image from "next/image";
import Navbar from "../navigator";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

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

export default function Menu({ categories: initialCategories, email }: { categories: Category[], email?: string }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories); // <-- new state
  const [activeCategory, setActiveCategory] = useState<number>(initialCategories[0]?.id || 0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  const router = useRouter();
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
        body: JSON.stringify({ name, price, categoryId }),
      });

      if (!res.ok) throw new Error("Failed to create product");

      // Refresh page to show the new product
      router.refresh();
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
      router.refresh();
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

      router.refresh();
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

      router.refresh();
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
      router.refresh();
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

      router.refresh();
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

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Μενού | Σουβλατζίδικο</title>
        <meta name="description" content="Μενού αυθεντικών ελληνικών σουβλακιών" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar />

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

                    <button
                      onClick={() => setShowSearch((prev) => !prev)}
                      className="ml-4 p-2 rounded hover:bg-gray-100"
                    >
                      {showSearch ? (
                        <X className="w-6 h-6 text-gray-600" />
                      ) : (
                        <Search className="w-6 h-6 text-gray-600" />
                      )}
                    </button>

                    {/* Search Input (appears when icon clicked) */}
                    {showSearch && (
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ml-2 px-3 py-2 border rounded"
                        autoFocus
                      />
                    )}
                </div>
            </section>

            {/* Categories & Products */}
            <div className="space-y-12 mt-6 p-6">
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
                      <div className="flex gap-1">
                        <div className="flex gap-1">
                          <button onClick={() => moveCategory(category.id, "up")}>↑</button>
                          <button onClick={() => moveCategory(category.id, "down")}>↓</button>
                        </div>

                        <div className="my-4">
                          <button
                            onClick={saveCategoryPositions}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Save Positions
                          </button>
                        </div>

                        {/* Create Product Icon */}
                        <button
                          onClick={() => handleCreateProduct(category.id)}
                          className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                          title="Create Product"
                        >
                          {/* Plus icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>

                        {/* Edit Category Icon */}
                        <button
                          onClick={() => handleEditCategory(category.id, category.name)}
                          className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          title="Edit Category"
                        >
                          {/* Pencil icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 0v2m6 6l-6 6H5v-6l6-6h6z" />
                          </svg>
                        </button>

                        {/* Delete Category Icon */}
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                          title="Delete Category"
                        >
                          {/* Trash icon */}
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="border p-4 rounded shadow hover:shadow-md transition cursor-pointer relative"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover rounded"
                          />
                        )}
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        {product.offer && <p className="text-red-500 font-semibold">On Offer!</p>}
                        <p className="mt-1 font-semibold">${product.price.toFixed(2)}</p>

                        {/* Delete Product Button */}
                        {email === "kopotitore@gmail.com" && (
                          <div className="absolute top-2 right-2 flex flex-col gap-1">
                            {/* Edit Product Icon */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product.id, product.name);
                              }}
                              className="p-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                              title="Edit Product"
                            >
                              {/* Pencil icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-1 0v2m6 6l-6 6H5v-6l6-6h6z" />
                              </svg>
                            </button>

                            {/* Delete Product Icon */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product.id, product.name);
                              }}
                              className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                              title="Delete Product"
                            >
                              {/* Trash icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
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