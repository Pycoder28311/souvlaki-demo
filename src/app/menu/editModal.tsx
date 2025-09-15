import { useState } from "react";

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

type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
};

// types.ts or inside EditModal.tsx
interface EditModalProps {
  orderItem: OrderItem;
  defaultSelectedIngredients?: Ingredient[];
  onClose: () => void;
  editItem: (
    orderItemToEdit: OrderItem,
    selectedIngredients: Ingredient[],
  ) => void;
  changeQuantity: (newQuantity: number) => void;
  quantity?: number;
}

export default function EditModal({ orderItem,  defaultSelectedIngredients = [], onClose, editItem, changeQuantity, quantity }: EditModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    defaultSelectedIngredients
  );

  const toggleIngredient = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) =>
        prev.some((i) => i.id === ingredient.id)
        ? prev.filter((i) => i.id !== ingredient.id) // remove if already selected
        : [...prev, ingredient] // add if not selected
    );
  };

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

        {!loading && orderItem && (
          <>

            <h2 className="text-2xl font-bold mb-2">{orderItem.name}</h2>

            <div className="flex flex-col gap-4">
            {/* Quantity controls */}
            <div className="flex items-center gap-4">
                <button
                onClick={() =>
                    changeQuantity(-1)
                }
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                -
                </button>
                <span className="font-semibold text-lg">{quantity}</span>
                <button
                onClick={() =>
                    changeQuantity(1)
                }
                className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                +
                </button>
            </div>

            {/* Add to cart button */}
            <button
                onClick={() => {
                if (orderItem) {
                    editItem(orderItem, selectedIngredients);
                    setSelectedIngredients([]);
                    onClose(); // close modal
                }
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
            >
                Ενημέρωση
            </button>
            </div>

            {orderItem && orderItem.selectedIngCategories?.map((ingCat) => (
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
                            <img
                            src={ing.image}
                            alt={ing.name}
                            className="w-10 h-10 object-cover rounded"
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
