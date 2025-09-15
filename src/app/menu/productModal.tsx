import { useEffect, useState } from "react";

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
  addToCart: (p: Product) => void;
};

export default function ProductModal({ product, onClose, addToCart }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!product) return;

    // Fetch product details including IngCategories and Ingredients
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${product.id}`); // create this API route
        const data = await res.json();
        setFullProduct(data);
      } catch (err) {
        console.error(err);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
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
              <img
                src={fullProduct.image}
                alt={fullProduct.name}
                className="w-full h-64 object-cover rounded mb-4"
              />
            )}

            <h2 className="text-2xl font-bold mb-2">{fullProduct.name}</h2>
            {fullProduct.offer && <p className="text-red-500 font-semibold mb-2">On Offer!</p>}

            <button
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition mb-4"
              onClick={() => addToCart(fullProduct)}
            >
              Προσθήκη στο Καλάθι
            </button>

            {/* IngCategories and Ingredients */}
            {fullProduct.ingCategories?.map((ingCat) => (
              <div key={ingCat.id} className="mb-4">
                <h3 className="font-bold text-lg mb-2">{ingCat.name}</h3>
                <div className="space-y-2">
                  {ingCat.ingredients.map((ing) => (
                    <div key={ing.id} className="flex items-center gap-2 border p-2 rounded">
                      {ing.image && (
                        <img src={ing.image} alt={ing.name} className="w-10 h-10 object-cover rounded" />
                      )}
                      <div>
                        <p className="font-semibold">{ing.name}</p>
                      </div>
                    </div>
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
