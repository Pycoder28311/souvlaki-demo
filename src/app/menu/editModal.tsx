import { useState } from "react";
import Image from 'next/image';
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
        className="
          bg-white p-6 
          w-full h-full
          sm:max-w-md sm:rounded-lg sm:max-h-[90vh]
          relative overflow-y-auto
        "
        onClick={handleContentClick}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-700 text-5xl"
          onClick={onClose}
        >
          ×
        </button>

        { orderItem && (
          <>
            <h2 className="text-2xl font-bold mb-2">{orderItem.name}</h2>

            <div className="bg-white flex gap-4 z-50">
              {/* Quantity controls */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                      changeQuantity(-1)
                  }
                  className="px-2 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Minus className="w-6 h-6 text-black" />
                </button>

                <span className="font-semibold text-lg">{quantity}</span>

                <button
                  onClick={() =>
                      changeQuantity(1)
                  }
                  className="px-2 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                >
                  <Plus className="w-6 h-6 text-black" />
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
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 text-lg"
              >
                <span>Ενημέρωση</span>
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
