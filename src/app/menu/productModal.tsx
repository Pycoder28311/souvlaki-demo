"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react"
import { ChevronDown, ChevronRight, X } from "lucide-react";

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
  delete?: boolean;
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
  delete?: boolean;
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

type ModalProps = {
  email?: string;
  product: Product | null;
  onClose: () => void;
  addToCart: (product: Product, selectedIngredients: Ingredient[], selectedIngCategories: IngCategory[], selectedOptions: Option[], options: Option[]) => void;
};

export default function ProductModal({ email, product, onClose, addToCart }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [quantity, setQuantity] = useState(1);

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
  const [openOptions, setOpenOptions] = useState<Record<number, boolean>>({});

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
  }

  const handleSubmit = async (e: React.FormEvent, productId: number) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("productId", String(productId)); // <-- στέλνουμε το ID του προϊόντος

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Το αρχείο ανέβηκε επιτυχώς! Πατήστε το κουμπί Αποθήκευσης Αλλαγών για να αποθηκεύσετε τις αλλαγές.");
    } else {
      setMessage("❌ Σφάλμα: " + data.error);
    }

    setUploading(false);
  };

  const toggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) =>
        prev.some((i) => i.id === ingredient.id)
        ? prev.filter((i) => i.id !== ingredient.id) // remove if already selected
        : [...prev, ingredient] // add if not selected
    );
  };

  const toggleOption = (option: Option) => {
    setSelectedOptions((prev) =>
      prev.some((i) => i.id === option.id)
        ? prev.filter((i) => i.id !== option.id) // remove if already selected
        : [...prev, option] // add αν δεν υπάρχει
    );
  };

  const [ingCategories, setIngCategories] = useState<IngCategory[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

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

  const [animate, setAnimate] = useState(false);

  useEffect(() => {
      // Trigger animation on next tick
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
  }, []);


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
  };

  const handleMakeRequiredCat = (catId: number) => {
    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((c) =>
        c.id === catId ? { ...c, isRequired: !c.isRequired } : c
      );

      return { ...prev, ingCategories: newCategories };
    });
  };

  const handleAddCategory = () => {
    const name = prompt("Εισάγετε το νέο όνομα της κατηγορίας");
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
  };

  const handleAddOption = () => {
    const question = prompt("Εισάγετε τη νέα ερώτηση της επιλογής");
    if (!question) return;

    const price = prompt("Εισάγετε την τιμή της επιλογής");
    if (!price) return;

    const comment = prompt("Εισάγετε το σχόλιο για την επιλογή");
    if (!comment) return;

    setFullProduct((prev) => {
      if (!prev) return prev;
      const newOption: Option = {
        id: Date.now(),       // temporary ID
        question: question,     // το πεδίο είναι 'answer', όχι 'question'
        price: Number(price), // σωστή μετατροπή σε number
        comment: comment,     // optional
        productId: product?.id
      };
      return { ...prev, options: [...(prev.options || []), newOption] };
    });
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
  };

  const handleDeleteOption = (id: number) => {
    setFullProduct((prev) => {
      if (!prev) return prev;
      const updatedOptions = prev.options?.filter((opt) => opt.id !== id);
      return { ...prev, options: updatedOptions };
    });
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
        <div className="overflow-y-auto max-h-full sm:max-h-[80vh] pb-12" style={{
          scrollbarWidth: 'none', // Firefox
        }}>
          {/* Loading state */}
          {loading && <p className="text-center py-6">Φόρτωση...</p>}

          {!loading && fullProduct && (
            <>
              {fullProduct.imageId ? (
                <div className="w-full h-[40vh] sm:h-64 relative overflow-hidden shadow-sm mb-4 rounded-t-lg">
                  <Image
                    src={`/api/images/${fullProduct.imageId}`}
                    alt={fullProduct.name}
                    fill
                    style={{ objectFit: "cover", objectPosition: "center" }}
                    className="rounded-t-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-[40vh] sm:h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg mb-4">
                  Χωρίς Εικόνα
                </div>
              )}

              <button
                className="absolute top-0 right-0 bg-white rounded-lg px-2 py-2 shadow-md flex items-center justify-center text-gray-700 text-4xl m-2"
                onClick={onClose}
              >
                <X className="w-7 h-7" />
              </button>

              {email === "kopotitore@gmail.com" && (
                <div className="p-6 max-w-lg mx-auto">
                  <h1 className="text-xl font-bold mb-4">Ανέβασε Εικόνα</h1>
            
                  <form onSubmit={(e) => handleSubmit(e, product.id)} className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full border p-2 rounded"
                    />
            
                    <button
                      type="submit"
                      disabled={uploading || !file}
                      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                      {uploading ? "Μεταφόρτωση..." : "Μεταφόρτωση"}
                    </button>
            
                    {/* Preview below button */}
                    {preview && (
                      <div className="mt-4 w-32 h-32 relative mx-auto">
                        <Image
                          src={preview}
                          alt="preview"
                          fill
                          className="rounded shadow object-contain"
                        />
                      </div>
                    )}
                  </form>
            
                  {message && <p className="mt-4">{message}</p>}
                </div>
              )}

              <div className="p-6">
                <div className="flex justify-between mb-2 items-center">
                  <h2 className="text-4xl font-bold">{fullProduct.name}</h2>
                  <p className="font-bold text-yellow-600 text-2xl mt-0.5 flex items-center gap-2">
                    {product.offer && product.offerPrice ? (
                      <>
                        <span>{Number(product.price).toFixed(2)}€</span>
                        <span className="line-through text-gray-400">{Number(product.offerPrice).toFixed(2)}€</span>
                      </>
                    ) : (
                      <span>{Number(product.price).toFixed(2)}€</span>
                    )}
                  </p>
                </div>
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                  {fullProduct.description}
                </p>

                {fullProduct.ingCategories
                ?.filter((ingCat) => !ingCat.delete) // hide deleted categories
                .map((ingCat) => {
                  const open = openCategories[ingCat.id] ?? false;

                  return (
                    <div 
                      key={ingCat.id}
                      id={`ing-cat-${ingCat.id}`} 
                      className="mb-4 border rounded-lg shadow-sm bg-white"
                    >
                      {/* Header with dropdown arrow */}
                      <div
                        onClick={() => toggleCategory(ingCat.id)}
                        className="flex justify-between items-center px-3 py-2 cursor-pointer bg-gray-100 rounded-t-lg hover:bg-gray-200 transition"
                      >
                        <div className="flex items-center gap-2">
                          {open ? (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          )}
                          <h3 className="font-bold text-lg text-gray-800">{ingCat.name}</h3>
                          {ingCat.isRequired && (
                            <span className="ml-2 text-xs font-medium bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                              Υποχρεωτικό
                            </span>
                          )}
                        </div>

                        {email === "kopotitore@gmail.com" && (
                          <div className="flex gap-1">
                            {/* Edit Category */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditCategoryName(ingCat.id);
                              }}
                              className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded text-xs font-semibold transition-shadow shadow-sm"
                              title="Επεξεργασία Κατηγορίας"
                            >
                              Όνομα
                            </button>

                            {/* Make Required / Optional */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakeRequiredCat(ingCat.id);
                              }}
                              className={`px-2 py-1 rounded text-xs font-semibold text-white transition-shadow shadow-sm ${
                                ingCat.isRequired
                                  ? "bg-orange-600 hover:bg-orange-700"
                                  : "bg-orange-500 hover:bg-orange-600"
                              }`}
                              title={ingCat.isRequired ? "Κάνε Προαιρετική" : "Κάνε Υποχρεωτική"}
                            >
                              {ingCat.isRequired ? "Προαιρετική" : "Υποχρεωτική"}
                            </button>

                            {/* Delete Category */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCategory(ingCat.id);
                              }}
                              className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-shadow shadow-sm"
                              title="Διαγραφή Κατηγορίας"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Collapsible content */}
                      {open && (
                        <div className="p-3 space-y-2">
                          {ingCat.ingredients.map((ing) => (
                            <label
                              key={ing.id}
                              className="flex items-center gap-3 border rounded-md p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                            >
                              <input
                                type="checkbox"
                                checked={selectedIngredients.some((i) => i.id === ing.id)}
                                onChange={() => toggleIngredient(ing)}
                                className="h-4 w-4"
                              />

                              {ing.image && (
                                <Image
                                  src={ing.image}
                                  alt={ing.name}
                                  width={40}
                                  height={40}
                                  className="object-cover rounded"
                                />
                              )}

                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">{ing.name}</p>
                                {ing.price > 0 && (
                                  <p className="text-sm text-gray-600">+{Number(ing.price).toFixed(2)}€</p>
                                )}
                              </div>

                              {email === "kopotitore@gmail.com" && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEditIngredientName(ingCat.id, ing.id);
                                    }}
                                    className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded text-xs font-semibold transition-shadow shadow-sm"
                                    title="Επεξεργασία Ερώτησης"
                                  >
                                    Όνομα
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleEditIngredientPrice(ingCat.id, ing.id, ing.price);
                                    }}
                                    className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition text-xs font-medium"
                                    title="Edit Price"
                                  >
                                    Τιμή
                                  </button>

                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleDeleteIngredient(ingCat.id, ing.id);
                                    }}
                                    className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-shadow shadow-sm"
                                    title="Διαγραφή Κατηγορίας"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </label>
                          ))}

                          {email === "kopotitore@gmail.com" && (
                            <button
                              onClick={() => handleAddIngredient(ingCat.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              + Προσθήκη Συστατικού
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {fullProduct.options
                  ?.filter((opt) => !opt.delete) // hide deleted options
                  .map((opt) => {
                    const open = openOptions[opt.id] ?? false;

                    return (
                      <div
                        key={opt.id}
                        id={`opt-${opt.id}`}
                        className="mb-4 border rounded-lg shadow-sm bg-white"
                      >
                        {/* Header with toggle */}
                        <div
                          onClick={() =>
                            setOpenOptions((prev) => ({
                              ...prev,
                              [opt.id]: !prev[opt.id],
                            }))
                          }
                          className="flex justify-between items-center px-3 py-2 cursor-pointer bg-gray-100 rounded-t-lg hover:bg-gray-200 transition"
                        >
                          <div className="flex items-center gap-2">
                            {open ? (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-600" />
                            )}
                            <h3 className="font-bold text-lg text-gray-800">{opt.question}</h3>
                          </div>

                          {email === "kopotitore@gmail.com" && (
                            <div className="flex gap-1">
                              {/* Edit Question */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOptionQuestion(opt.id);
                                }}
                                className="px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-white rounded text-xs font-semibold transition-shadow shadow-sm"
                                title="Επεξεργασία Ερώτησης"
                              >
                                Όνομα
                              </button>

                              {/* Edit Price */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOptionPrice(opt.id);
                                }}
                                className="px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition text-xs font-medium"
                                title="Edit Price"
                              >
                                Τιμή
                              </button>

                              {/* Edit Comment */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditOptionComment(opt.id);
                                }}
                                className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold transition-shadow shadow-sm"
                                title="Επεξεργασία Σχολίου"
                              >
                                Σχόλιο
                              </button>

                              {/* Delete Option */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOption(opt.id);
                                }}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-shadow shadow-sm"
                                title="Διαγραφή Επιλογής"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Collapsible content */}
                        {open && (
                          <div className="p-3 space-y-2">
                            <label className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`option-${opt.id}`}
                                value="yes"
                                checked={selectedOptions.some((i) => i.id === opt.id)}
                                onChange={() => toggleOption(opt)}
                              />
                              Ναι
                            </label>
                            <label className="flex items-center gap-3">
                              <input
                                type="radio"
                                name={`option-${opt.id}`}
                                value="no"
                                checked={!selectedOptions.some((i) => i.id === opt.id)}
                                onChange={() => toggleOption(opt)}
                              />
                              Όχι
                            </label>
                            {opt.price > 0 && (
                              <p className="text-sm text-gray-600">Τιμή: {Number(opt.price).toFixed(2)}€</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                })}

                {email === "kopotitore@gmail.com" && (
                  <div className="flex justify-between">
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 mr-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      + Προσθήκη Κατηγορίας
                    </button>
                    <button
                      onClick={handleAddOption}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      + Προσθήκη Επιλογής
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {email === "kopotitore@gmail.com" && (
            <div className="w-full flex justify-center">
              <button
                onClick={async () => {
                  if (!fullProduct) return;
                  setLoading(true);

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
                    setLoading(false);
                  }
                }}
                className="h-12 w-[90%] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-12"
                disabled={loading}
              >
              {loading ? "Αποθήκευση..." : "Αποθήκευση Αλλαγών"}
            </button>
            </div>
          )}
        </div>
        <div className="fixed inset-x-0 bottom-0 bg-white p-4 border-t border-gray-300 shadow-md flex gap-4 z-50 rounded-b-lg">

          {/* Quantity controls */}
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
              if (!product) return;

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
            <span className="sm:hidden">Προσθήκη</span>
            <span className="hidden sm:inline">Προσθήκη στο Καλάθι</span>
          </button>
        </div>
      </div>
    </div>
  );
}
