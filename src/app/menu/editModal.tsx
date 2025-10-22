import { useState } from "react";
import Image from 'next/image';
import { Minus, Plus, ChevronDown, ChevronRight, X } from "lucide-react"

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

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  delete?: boolean;
  productId?: number;
};

type OrderItem = {
  imageId: number | null;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  selectedIngredients?: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
  selectedOptions?: Option[];
  options?: Option[];
};

// types.ts or inside EditModal.tsx
interface EditModalProps {
  orderItem: OrderItem;
  defaultSelectedIngredients?: Ingredient[];
  onClose: () => void;
  editItem: (
    orderItemToEdit: OrderItem,
    selectedIngredients: Ingredient[],
    selectedOptions?: Option[] | undefined,
  ) => void;
  changeQuantity: (newQuantity: number) => void;
  quantity?: number;
}

export default function EditModal({ orderItem,  defaultSelectedIngredients = [], onClose, editItem, changeQuantity, quantity }: EditModalProps) {
  
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(defaultSelectedIngredients);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>(orderItem.selectedOptions || []);
  const [openCategories, setOpenCategories] = useState<Record<number, boolean>>({});
  const [openOptions, setOpenOptions] = useState<Record<number, boolean>>({});

  // Toggle function
  const toggleCategory = (catId: number) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // toggleOption όπως toggleIngredient
  const toggleOption = (option: Option, isYes: boolean) => {
    setSelectedOptions((prev) => {
      if (isYes) {
        // προσθέτουμε αν δεν υπάρχει
        return prev.some((o) => o.id === option.id) ? prev : [...prev, option];
      } else {
        // αφαιρούμε αν υπάρχει
        return prev.filter((o) => o.id !== option.id);
      }
    });
  };

  const toggleIngredient = (ingredient: Ingredient) => {
    console.log(orderItem)
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
          bg-white 
          w-full h-full
          sm:max-w-11/12 sm:h-auto sm:max-w-xl sm:rounded-lg sm:max-h-[90vh]
          relative overflow-y-auto
        "
        onClick={handleContentClick}
      >

        { orderItem && (
          <>
            {orderItem.imageId ? (
              <div className="w-full h-[40vh] sm:h-64 relative overflow-hidden shadow-sm mb-4 rounded-t-lg">
                <Image
                  src={`/api/images/${orderItem.imageId}`}
                  alt={"image of product"}
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
            <div className="p-6">
              <div className="flex gap-4 mb-2">
                <h2 className="text-2xl font-bold">{orderItem.name}</h2>
              </div>

              <div className="bg-white mb-4 flex gap-4 z-50">
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
                      const missingCat = (orderItem.selectedIngCategories ?? []).find(
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

                      editItem(orderItem, selectedIngredients, selectedOptions);
                      setSelectedIngredients([]);
                      onClose(); // close modal
                    }
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 text-lg"
                >
                  <span>Ενημέρωση</span>
                </button>
              </div>

              {orderItem && orderItem.selectedIngCategories?.map((ingCat) => {
                const open = openCategories[ingCat.id] ?? false;

                return (
                  <div 
                    key={ingCat.id}
                    id={`ing-cat-${ingCat.id}`}  
                    className="mb-4 border rounded-lg shadow-sm bg-white"
                  >
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
                            Υποχρωτικό
                          </span>
                        )}
                      </div>
                    </div>

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
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              )}

              {orderItem && orderItem.options && orderItem.options?.map((opt) => {
                const open = openOptions[opt.id] ?? false;

                return (
                  <div
                    key={opt.id}
                    id={`opt-${opt.id}`}
                    className="mb-4 border rounded-lg shadow-sm bg-white"
                  >
                    <div 
                      key={opt.id}
                      id={`opt-${opt.id}`} 
                      className="flex justify-between items-center px-3 py-2 cursor-pointer bg-gray-100 rounded-t-lg hover:bg-gray-200 transition"
                      onClick={() =>
                        setOpenOptions((prev) => ({
                          ...prev,
                          [opt.id]: !prev[opt.id],
                        }))
                      }
                    >
                      <div className="flex items-center gap-2">
                        {open ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                        <h3 className="font-bold text-lg text-gray-800">{opt.question}</h3>
                      </div>
                    </div>

                    {open && (
                      <div className="p-3 space-y-2">
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`option-${opt.id}`}
                            value="yes"
                            checked={selectedOptions.some((i) => i.id === opt.id)}
                            onChange={() => toggleOption(opt,true)}
                          />
                          Ναι
                        </label>
                        <label className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`option-${opt.id}`}
                            value="no"
                            checked={!selectedOptions.some((i) => i.id === opt.id)}
                            onChange={() => toggleOption(opt,false)}
                          />
                          Όχι
                        </label>
                        {opt.price > 0 && (
                          <p className="text-sm text-gray-600">Τιμή: {Number(opt.price).toFixed(2)}€</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
