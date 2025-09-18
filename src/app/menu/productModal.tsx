import { useEffect, useState } from "react";
import Image from "next/image";

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

type ModalProps = {
  product: Product | null;
  onClose: () => void;
  addToCart: (product: Product, selectedIngredients: Ingredient[], selectedIngCategories: IngCategory[]) => void;
};

export default function ProductModal({ product, onClose, addToCart }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) =>
        prev.some((i) => i.id === ingredient.id)
        ? prev.filter((i) => i.id !== ingredient.id) // remove if already selected
        : [...prev, ingredient] // add if not selected
    );
  };

  const [ingCategories, setIngCategories] = useState<IngCategory[]>([]);

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
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product]);

  if (!product) return null;

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-md w-full relative max-h-[90vh] overflow-y-auto"
        onClick={handleContentClick}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-700 font-bold"
          onClick={onClose}
        >
          ×
        </button>

        {/* Loading state */}
        {loading && <p className="text-center py-6">Loading...</p>}

        {!loading && fullProduct && (
          <>
            {fullProduct.image && (
              <Image
                src={fullProduct.image}           // URL of the image
                alt={fullProduct.name}            // alt text
                width={40}                // width in pixels
                height={40}               // height in pixels
                className="object-cover rounded"
              />
            )}

            <h2 className="text-2xl font-bold mb-2">{fullProduct.name}</h2>
            {fullProduct.offer && <p className="text-red-500 font-semibold mb-2">On Offer!</p>}

            <div className="flex flex-col gap-4">
            {/* Quantity controls */}
            <div className="flex items-center gap-4">
                <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                –
                </button>
                <span className="font-semibold text-lg">{quantity}</span>
                <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                +
                </button>
            </div>

            {/* Add to cart button */}
            <button
                onClick={() => {
                if (product) {
                    // Add product with chosen quantity
                    for (let i = 0; i < quantity; i++) {
                    addToCart(
                      product,
                      selectedIngredients,
                      ingCategories ?? [] // ✅ fallback to empty array
                    );
                    }
                    setSelectedIngredients([]); // reset for next product
                    setQuantity(1); // reset quantity
                    onClose(); // close modal
                }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
            >
                Προσθήκη στο Καλάθι
            </button>
            </div>

            {fullProduct.ingCategories?.map((ingCat) => (
                <div key={ingCat.id} className="mb-4">
                    <h3 className="font-bold text-lg mb-2">{ingCat.name}</h3>
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
                        </label>
                    ))}
                    </div>
                </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
