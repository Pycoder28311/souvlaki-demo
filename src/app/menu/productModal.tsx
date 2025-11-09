"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, X, Save } from "lucide-react"
import { Ingredient, IngCategory, Option, Product, Category } from "../types";
import ProductDetail from "./components/productDetails";
import { useCart } from "../wrappers/cartContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import isEqual from "lodash.isequal";

interface ProductWithCategory extends Product {
  category: {
    id: number;
    name: string;
    openHour: string;
    closeHour: string;
    alwaysClosed: boolean;
  };
}

type ModalProps = {
  business?: boolean;
  product: Product | null;
  onClose: () => void;
  addToCart: (product: Product, selectedIngredients: Ingredient[], selectedIngCategories: IngCategory[], selectedOptions: Option[], options: Option[]) => void;
  setCategories?: React.Dispatch<React.SetStateAction<Category[]>>;
  setMenuItems?: React.Dispatch<React.SetStateAction<ProductWithCategory[]>>
};

export default function ProductModal({ business, product, onClose, addToCart, setCategories, setMenuItems }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [quantity, setQuantity] = useState(1);

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
  const [openOptions, setOpenOptions] = useState<Record<number, boolean>>({});
  const { shopOpen } = useCart();

  const [ingCategories, setIngCategories] = useState<IngCategory[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [animate, setAnimate] = useState(false);
  const [popup, setPopup] = useState(false);

  useEffect(() => {
    if (!product) return;

    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${product.id}`);
        const data: Product = await res.json();

        setFullProduct(data);

        // ✅ Αποθηκεύουμε απευθείας τις κατηγορίες υλικών σε ξεχωρισμένο state
        setIngCategories(data.ingCategories ?? []);
        setOptions(data.options ?? []);
      } catch (err) {
        console.error("Αποτυχία ανάκτησης λεπτομερειών προϊόντος:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product]);

  useEffect(() => {
      document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
      // Trigger animation on next tick
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
  }, []);

  const triggerPopupEffect = () => {
    setPopup(true);
    setTimeout(() => setPopup(false), 300); // effect διαρκεί 300ms
  };

  // Toggle function
  const toggleCategory = (catId: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)

    if (selected) {
      setPreview(URL.createObjectURL(selected))
    }
    triggerPopupEffect();
  }

  const toggleIngredient = (ingredient: Ingredient, ingCategory: IngCategory) => {
    setSelectedIngredients((prev) => {
      if (ingCategory.onlyOne) {
        // Αν η κατηγορία έχει onlyOne, κρατάμε μόνο το ingredient που κλικάρησες
        return [ingredient];
      } else {
        // Κανονικό toggle για πολλαπλές επιλογές
        const exists = prev.some((i) => i.id === ingredient.id);
        return exists ? prev.filter((i) => i.id !== ingredient.id) : [...prev, ingredient];
      }
    });
  };

  const toggleOption = (option: Option) => {
    setSelectedOptions((prev) =>
      prev.some((i) => i.id === option.id)
        ? prev.filter((i) => i.id !== option.id) // remove if already selected
        : [...prev, option] // add αν δεν υπάρχει
    );
  };

  const handleEditIngredientName = (catId: number, ingId: number) => {
    const cat = fullProduct?.ingCategories?.find((c) => c.id === catId);
    const ing = cat?.ingredients.find((i) => i.id === ingId);
    if (!ing) return;

    const newName = prompt("Επεξεργασία ονόματος συστατικού", ing.name);
    if (!newName) return;

    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((c) => {
        if (c.id !== catId) return c;

        const newIngredients = c.ingredients.map((i) =>
          i.id === ingId ? { ...i, name: newName } : i
        );

        return { ...c, ingredients: newIngredients };
      });

      return { ...prev, ingCategories: newCategories };
    });

    triggerPopupEffect();
  };

  const handleEditCategoryName = (catId: number) => {
    const cat = fullProduct?.ingCategories?.find((c) => c.id === catId);
    if (!cat) return;

    const newName = prompt("Επεξεργασία ονόματος κατηγορίας", cat.name);
    if (!newName) return;

    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((c) =>
        c.id === catId ? { ...c, name: newName } : c
      );

      return { ...prev, ingCategories: newCategories };
    });

    triggerPopupEffect();
  };

  const handleMakeRequiredCat = (catId: number) => {
    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((c) =>
        c.id === catId ? { ...c, isRequired: !c.isRequired } : c
      );

      return { ...prev, ingCategories: newCategories };
    });

    triggerPopupEffect();
  };

  const handleOnlyOneCat = (catId: number) => {
    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((c) =>
        c.id === catId ? { ...c, onlyOne: !c.onlyOne } : c
      );

      return { ...prev, ingCategories: newCategories };
    });

    triggerPopupEffect();
  };

  const handleAddCategory = () => {
    const name = prompt("Εισάγετε το όνομα της νέας κατηγορίας");
    if (!name) return;

    setFullProduct((prev) => {
      if (!prev) return prev;
      const newCategory: IngCategory = {
        id: Date.now(), // temporary ID
        name,
        ingredients: [],
      };
      return { ...prev, ingCategories: [...(prev.ingCategories || []), newCategory] };
    });

    triggerPopupEffect();
  };

  const handleAddOption = () => {
    const question = prompt("Εισάγετε τη ερώτηση της επιλογής");
    if (!question) return;

    const priceStr = prompt("Εισάγετε την τιμή της επιλογής (μόνο αριθμό)");
    if (!priceStr) {
      alert("Η τιμή είναι υποχρεωτική.");
      return;
    }

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      alert("Η τιμή πρέπει να είναι θετικός αριθμός μεγαλύτερος του 0.");
      return;
    }

    const comment = prompt("Εισάγετε το όνομα του προϊόντος που αφορά η επιλογή");
    if (!comment) return;

    setFullProduct((prev) => {
      if (!prev) return prev;
      const newOption: Option = {
        id: Date.now(), // temporary ID
        question: question.trim(),
        price: price,
        comment: comment.trim(),
        productId: product?.id,
      };
      return { ...prev, options: [...(prev.options || []), newOption] };
    });

    triggerPopupEffect();
  };

  const handleEditOptionQuestion = (optionId: number) => {
    if (!fullProduct?.options) return;

    const option = fullProduct.options.find((o) => o.id === optionId);
    if (!option) return;

    const newQuestion = prompt("Επεξεργασία ερώτησης επιλογής", option.question);
    if (!newQuestion) return;

    setFullProduct((prev) => {
      if (!prev || !prev.options) return prev;

      const newOptions = prev.options.map((o) =>
        o.id === optionId ? { ...o, question: newQuestion } : o
      );

      return { ...prev, options: newOptions };
    });

    triggerPopupEffect();
  };

  const handleEditOptionPrice = (optionId: number) => {
    if (!fullProduct?.options) return;

    const option = fullProduct.options.find((o) => o.id === optionId);
    if (!option) return;

    const newPrice = prompt("Επεξεργασία τιμής επιλογής", option.price.toString());
    if (newPrice === null) return;

    setFullProduct((prev) => {
      if (!prev || !prev.options) return prev;

      const newOptions = prev.options.map((o) =>
        o.id === optionId ? { ...o, price: Number(newPrice) } : o
      );

      return { ...prev, options: newOptions };
    });

    triggerPopupEffect();
  };

  const handleEditOptionComment = (optionId: number) => {
    if (!fullProduct?.options) return;

    const option = fullProduct.options.find((o) => o.id === optionId);
    if (!option) return;

    const newComment = prompt("Επεξεργασία σχολίου επιλογής", option.comment || "");
    if (newComment === null) return;

    setFullProduct((prev) => {
      if (!prev || !prev.options) return prev;

      const newOptions = prev.options.map((o) =>
        o.id === optionId ? { ...o, comment: newComment } : o
      );

      return { ...prev, options: newOptions };
    });

    triggerPopupEffect();
  };

  const handleDeleteOption = (id: number) => {
    setFullProduct((prev) => {
      if (!prev) return prev;
      const updatedOptions = prev.options?.filter((opt) => opt.id !== id);
      return { ...prev, options: updatedOptions };
    });

    triggerPopupEffect();
  };

  const handleDeleteCategory = (catId: number) => {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την κατηγορία;")) return;

    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;
      return {
        ...prev,
        ingCategories: prev.ingCategories.map((c) =>
          c.id === catId ? { ...c, delete: true } : c
        ),
      };
    });

    triggerPopupEffect();
  };

  const handleAddIngredient = (catId: number) => {
    const name = prompt("Εισάγετε το όνομα της επιλογής");
    if (!name) return;

    const priceStr = prompt("Εισάγετε την τιμή της επιλογής");
    if (!priceStr) return;

    const price = parseFloat(priceStr);
    if (isNaN(price) || price <= 0) {
      return alert("Η τιμή πρέπει να είναι θετικός αριθμός μεγαλύτερος του 0");
    }

    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((cat) => {
        if (cat.id !== catId) return cat;
        const newIngredient: Ingredient = { id: Date.now(), name, price };
        return { ...cat, ingredients: [...cat.ingredients, newIngredient] };
      });

      return { ...prev, ingCategories: newCategories };
    });

    triggerPopupEffect();
  };

  const handleDeleteIngredient = (catId: number, ingId: number) => {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το συστατικού;")) return;

    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((cat) => {
        if (cat.id !== catId) return cat;
        return { ...cat, ingredients: cat.ingredients.filter((i) => i.id !== ingId) };
      });

      return { ...prev, ingCategories: newCategories };
    });

    triggerPopupEffect();
  };

  const handleEditIngredientPrice = (catId: number, ingId: number, currentPrice: number) => {
    const newPriceStr = prompt("Εισάγετε τη νέα τιμή του συστατικού", currentPrice.toString());
    if (!newPriceStr) return;

    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice)) return alert("Η τιμή πρέπει να είναι αριθμός");

    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((cat) => {
        if (cat.id !== catId) return cat;

        const newIngredients = cat.ingredients.map((ing) =>
          ing.id === ingId ? { ...ing, price: newPrice } : ing
        );

        return { ...cat, ingredients: newIngredients };
      });

      return { ...prev, ingCategories: newCategories };
    });

    triggerPopupEffect();
  };

  if (!product) return null;

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className={`
          bg-white
          w-full h-full relative
          sm:w-11/12 sm:h-auto sm:max-w-xl sm:max-h-[90vh] sm:rounded-lg
          transform transition-transform duration-300
          ${animate ? "translate-y-0" : "translate-y-full"}
            sm:translate-y-0 sm:transition-none
          `}
        onClick={handleContentClick}
      >
        <div className="overflow-y-auto max-h-full sm:max-h-[80vh] pb-12 mb-6" style={{
          scrollbarWidth: 'none', // Firefox
        }}>
          {/* Loading state */}
          {loading && 
            <p className="text-center py-6 flex justify-center">
              <AiOutlineLoading3Quarters className="text-gray-700 w-6 h-6 animate-spin" />
            </p>
          }

          {!loading && fullProduct && (
            <>
              {(preview || fullProduct.imageId) ? (
                <div className="w-full h-[40vh] sm:h-64 relative overflow-hidden shadow-sm mb-4 rounded-t-lg">
                  {/* Εικόνα προϊόντος */}
                    <Image
                      src={preview || `/api/images/${fullProduct.imageId}`}
                      alt={preview ? "preview" : fullProduct.name}
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      className="rounded-t-lg"
                    />

                  {/* Κουμπί αλλαγής εικόνας */}
                  {business && (
                    <label className="absolute bottom-2 right-2 cursor-pointer bg-white rounded-lg p-2 shadow-md flex items-center gap-2 hover:bg-gray-100">
                      <span className="sr-only">Choose file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <span className="text-lg ml-1">
                        {fullProduct.imageId ? "Άλλαξε εικόνα" : "Ανέβασε εικόνα"}
                      </span>
                      <Save className="w-5 h-5 text-gray-600" />
                    </label>
                  )}

                  {/* Κλείσιμο modal */}
                  <button
                    className="absolute top-2 right-2 bg-white rounded-lg px-2 py-2 shadow-md flex items-center justify-center text-gray-700"
                    onClick={onClose}
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="h-0">
                    <button
                      className="absolute top-0 right-0 bg-white rounded-lg px-2 py-2 shadow-md flex items-center justify-center text-gray-700 text-4xl m-2"
                      onClick={onClose}
                    >
                      <X className="w-7 h-7" />
                    </button>
                  </div>
                  {business && (
                      <label className="mt-2 ml-2 cursor-pointer bg-white rounded-lg p-2 shadow-md flex items-center gap-2 hover:bg-gray-100 w-fit">
                        <span className="sr-only">Choose file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <span className="text-lg ml-1">
                          {fullProduct.imageId ? "Άλλαξε εικόνα" : "Ανέβασε εικόνα"}
                        </span>
                        <Save className="w-5 h-5 text-gray-600" />
                      </label>
                  )}
                </>
              )}
              
              <ProductDetail
                fullProduct={fullProduct}
                business={business}
                selectedIngredients={selectedIngredients}
                selectedOptions={selectedOptions}
                openCategories={openCategories}
                openOptions={openOptions}
                setOpenOptions={setOpenOptions}
                toggleCategory={toggleCategory}
                toggleIngredient={toggleIngredient}
                toggleOption={toggleOption}
                handleEditCategoryName={handleEditCategoryName}
                handleMakeRequiredCat={handleMakeRequiredCat}
                handleOnlyOneCat={handleOnlyOneCat}
                handleDeleteCategory={handleDeleteCategory}
                handleAddIngredient={handleAddIngredient}
                handleEditIngredientName={handleEditIngredientName}
                handleEditIngredientPrice={handleEditIngredientPrice}
                handleDeleteIngredient={handleDeleteIngredient}
                handleEditOptionQuestion={handleEditOptionQuestion}
                handleEditOptionPrice={handleEditOptionPrice}
                handleEditOptionComment={handleEditOptionComment}
                handleDeleteOption={handleDeleteOption}
                handleAddCategory={handleAddCategory}
                handleAddOption={handleAddOption}
                setCategories={setCategories}
                setMenuItems={setMenuItems}
              />
            </>
          )}
        </div>
        <div className="fixed inset-x-0 bottom-0 bg-white p-4 border-t border-gray-300 shadow-md flex gap-4 z-50 rounded-b-lg">
          {business ? (
            <div className="w-full flex px-2 justify-center">
              <button
                onClick={async () => {
                  if (!fullProduct) return;
                  setLoadingSave(true);

                  if (file) {

                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("productId", String(product.id)); // <-- στέλνουμε το ID του προϊόντος

                    const res = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    });

                    if (!res.ok) throw new Error("Failed to save changes");
                  }

                  if (!isEqual(product, fullProduct)) {
                    try {
                      const res = await fetch(`/api/update-full-product/${fullProduct.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(fullProduct),
                      });

                      if (!res.ok) throw new Error("Failed to save changes");

                      alert("Οι αλλαγές αποθηκεύτηκαν επιτυχώς!");
                      window.location.reload(); // 🔄 reload the page
                    } catch (err) {
                      console.error(err);
                      alert("Error saving changes");
                    } finally {
                      setLoadingSave(false);
                    }
                  } else {
                    setLoadingSave(false)
                  }
                }}
                className={`
                  h-12 w-full px-4 py-2 bg-blue-500 text-white items-center rounded-lg
                  hover:bg-blue-600
                  transition-transform duration-200
                  ${popup ? "scale-110 shadow-lg" : ""}
                `}
                disabled={loadingSave}
              >
              {loadingSave ? 
                <div className="flex justify-center gap-2 items-center">
                  <p className="text-lg">Αποθήκευση</p>
                  <AiOutlineLoading3Quarters className="text-gray-100 w-4 h-4 animate-spin" />
                </div> : 
                <div className="flex justify-center items-center gap-2">
                  <p className="text-lg">Αποθήκευση Αλλαγών</p>
                  <Save className="w-5 h-5 text-gray-100" />
                </div>}
            </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Minus className="w-6 h-6 text-black" />
                </button>

                <span className="font-semibold text-lg">{quantity}</span>

                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-6 h-6 text-black" />
                </button>
              </div>

              {/* Add to cart button */}
              <button
                onClick={() => {
                  if (!product ||!shopOpen) return;

                  // Find the first required category missing selection
                  const missingCat = (ingCategories ?? []).find(
                    (cat) =>
                      cat.isRequired &&
                      !selectedIngredients.some((ing) => cat.ingredients.some((i) => i.id === ing.id))
                  );

                  if (missingCat) {
                    // Open that category
                    setOpenCategories((prev) => ({
                      ...prev,
                      [missingCat.id]: true,
                    }));

                    // Scroll into view smoothly
                    const element = document.getElementById(`ing-cat-${missingCat.id}`);
                    if (element) {
                      element.scrollIntoView({ behavior: "smooth", block: "center" });
                    }

                    return;
                  }

                  // Add to cart if all required ingredients selected
                  for (let i = 0; i < quantity; i++) {
                    addToCart(product, selectedIngredients, ingCategories ?? [], selectedOptions, options);
                  }

                  setSelectedIngredients([]);
                  setQuantity(1);
                  onClose();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 text-lg"
              >
                {shopOpen ? (
                  <>
                    <span className="sm:hidden">Προσθήκη</span>
                    <span className="hidden sm:inline">Προσθήκη στο Καλάθι</span>
                  </>
                ) : (
                  <>
                    <span className="sm:hidden">Κλειστό</span>
                    <span className="hidden sm:inline">Το κατάστημα είναι κλειστό</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
