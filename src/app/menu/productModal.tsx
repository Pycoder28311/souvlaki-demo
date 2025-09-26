import { useEffect, useState } from "react";
import Image from "next/image";
import { Minus, Plus } from "lucide-react"

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
  const [message, setMessage] = useState("")

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
    formData.append("productId", String(productId)); // <-- send product ID

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("✅ Uploaded successfully! Image ID: " + data.id);
    } else {
      setMessage("❌ Error: " + data.error);
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

        // ✅ directly store ingCategories in its own state
        setIngCategories(data.ingCategories ?? []);
        setOptions(data.options ?? [])
      } catch (err) {
        console.error("Failed to fetch product details:", err);
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

    const newName = prompt("Edit ingredient name", ing.name);
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

    const newName = prompt("Edit category name", cat.name);
    if (!newName) return;

    setFullProduct((prev) => {
      if (!prev || !prev.ingCategories) return prev;

      const newCategories = prev.ingCategories.map((c) =>
        c.id === catId ? { ...c, name: newName } : c
      );

      return { ...prev, ingCategories: newCategories };
    });
  };

  const handleAddCategory = () => {
    const name = prompt("Enter new category name");
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
    const question = prompt("Enter new question of option");
    if (!question) return;

    const price = prompt("Enter new option price");
    if (!price) return;

    const comment = prompt("Enter the comment of the option");
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

    const newQuestion = prompt("Edit option question", option.question);
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

    const newPrice = prompt("Edit option price", option.price.toString());
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

    const newComment = prompt("Edit option comment", option.comment || "");
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
    if (!confirm("Are you sure you want to delete this category?")) return;

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
    const name = prompt("Enter ingredient name");
    if (!name) return;

    const priceStr = prompt("Enter ingredient price");
    if (!priceStr) return;
    const price = parseFloat(priceStr);
    if (isNaN(price)) return alert("Price must be a number");

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
    if (!confirm("Are you sure you want to delete this ingredient?")) return;

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
    const newPriceStr = prompt("Enter new ingredient price", currentPrice.toString());
    if (!newPriceStr) return;

    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice)) return alert("Price must be a number");

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
          {loading && <p className="text-center py-6">Loading...</p>}

          {!loading && fullProduct && (
            <>
              {fullProduct.imageId ? (
                <div className="w-full h-[40vh] sm:h-64 relative overflow-hidden shadow-sm mb-4 rounded-t-lg">
                  <Image
                    src={`/api/images/${fullProduct.imageId}`}
                    alt={fullProduct.name}
                    fill
                    style={{ objectFit: "cover", objectPosition: "top" }}
                    className="rounded-t-lg"
                  />
                </div>
              ) : (
                <div className="w-full h-[40vh] sm:h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg mb-4">
                  No Image
                </div>
              )}

              <button
                className="absolute top-0 right-0 bg-white rounded-full px-3 py-0.5 shadow-md flex items-center justify-center text-gray-700 text-4xl m-2"
                onClick={onClose}
              >
                ×
              </button>

              {email === "kopotitore@gmail.com" && (
                <div className="p-6 max-w-lg mx-auto">
                  <h1 className="text-xl font-bold mb-4">Upload an Image</h1>
            
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
                      {uploading ? "Uploading..." : "Upload"}
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
                <h2 className="text-2xl font-bold mb-2">{fullProduct.name}</h2>

                {fullProduct.description}

                {fullProduct.ingCategories
                  ?.filter((ingCat) => !ingCat.delete) // hide deleted categories
                  .map((ingCat) => (
                    <div key={ingCat.id} className="mb-4">
                        <h3 className="font-bold text-lg mb-2">{ingCat.name}</h3>
                        {email === "kopotitore@gmail.com" && (
                          <div className="flex gap-2 mt-1">
                            {/* Edit Category */}
                            <button
                              onClick={() => handleEditCategoryName(ingCat.id)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-sm font-medium"
                              title="Edit Category"
                            >
                              Edit
                            </button>

                            {/* Delete Category */}
                            <button
                              onClick={() => handleDeleteCategory(ingCat.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                              title="Delete Category"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        <div className="space-y-2">
                        {ingCat.ingredients.map((ing) => (
                            <label
                              key={ing.id}
                              className="flex items-center gap-2 border p-2 rounded cursor-pointer"
                            >
                            <input
                              type="checkbox"
                              checked={selectedIngredients.some((i) => i.id === ing.id)}
                              onChange={() => toggleIngredient(ing)}
                            />
                            {ing.image && (
                              <Image
                                src={ing.image}           // URL of the image
                                alt={ing.name}            // alt text
                                width={40}                // width in pixels
                                height={40}               // height in pixels
                                className="object-cover rounded"
                              />
                            )}
                            <div>
                                <p className="font-semibold">{ing.name}</p>
                            </div>
                            {email === "kopotitore@gmail.com" && (
                              <div className="flex gap-1 mt-1">
                                {/* Edit Ingredient Name */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditIngredientName(ingCat.id, ing.id);
                                  }}
                                  className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-xs font-medium"
                                  title="Edit Ingredient Name"
                                >
                                  Edit
                                </button>

                                {/* Edit Ingredient Price */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditIngredientPrice(ingCat.id, ing.id, ing.price);
                                  }}
                                  className="px-2 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-xs font-medium"
                                  title="Edit Price"
                                >
                                  Price
                                </button>

                                {/* Delete Ingredient */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteIngredient(ingCat.id, ing.id);
                                  }}
                                  className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-xs font-medium"
                                  title="Delete Ingredient"
                                >
                                  Delete
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
                            + Add Ingredient
                          </button>
                        )}
                        </div>
                    </div>
                ))}

                {fullProduct.options
                  ?.filter((opt) => !opt.delete) // κρύψε τα options που έχουν flag delete
                  .map((opt) => (
                    <div key={opt.id} className="mb-4 border p-3 rounded">
                      <h3 className="font-bold text-lg mb-2">{opt.question}</h3>
                      <p className="text-sm">Price: {opt.price}</p>

                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`option-${opt.id}`}
                          value="yes"
                          checked={selectedOptions.some((i) => i.id === opt.id)}
                          onChange={() => toggleOption(opt)}
                        />
                        Yes
                      </label>

                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`option-${opt.id}`}
                          value="no"
                          checked={!selectedOptions.some((i) => i.id === opt.id)}
                          onChange={() => toggleOption(opt)}
                        />
                        No
                      </label>

                      {email === "kopotitore@gmail.com" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleEditOptionQuestion(opt.id)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                          >
                            Edit Question
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditOptionPrice(opt.id)}
                            className="px-2 py-1 bg-orange-500 text-white rounded text-xs"
                          >
                            Edit Price
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditOptionComment(opt.id)}
                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                          >
                            Edit Comment
                          </button>

                          {/* Delete Option */}
                          <button
                            onClick={() => handleDeleteOption(opt.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
                            title="Delete Option"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                {email === "kopotitore@gmail.com" && (
                  <>
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      + Add Category
                    </button>
                    <button
                      onClick={handleAddOption}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      + Add Option
                    </button>
                  </>
                )}
              </div>
            </>
          )}
          {email === "kopotitore@gmail.com" && (
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

                  alert("Changes saved successfully!");
                  window.location.reload(); // 🔄 reload the page
                } catch (err) {
                  console.error(err);
                  alert("Error saving changes");
                } finally {
                  setLoading(false);
                }
              }}
              className="h-12 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-12"
              disabled={loading}
            >
            {loading ? "Saving..." : "Save Changes"}
          </button>
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
              if (product) {
                for (let i = 0; i < quantity; i++) {
                  addToCart(product, selectedIngredients, ingCategories ?? [], selectedOptions, options);
                }
                setSelectedIngredients([]);
                setQuantity(1);
                onClose();
              }
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
