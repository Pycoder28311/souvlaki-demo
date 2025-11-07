import React from "react";
import { ChevronDown, ChevronRight, Trash2, Edit2, Plus, Pencil } from "lucide-react";
import { Product, Ingredient, Option, IngCategory } from "../../types";

interface ProductDetailProps {
  fullProduct: Product;
  business?: boolean;
  selectedIngredients: Ingredient[];
  selectedOptions: Option[];
  openCategories: Record<number, boolean>;
  openOptions: Record<number, boolean>;
  setOpenOptions: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  toggleCategory: (catId: number) => void;
  toggleIngredient: (ingredient: Ingredient, ingCategory: IngCategory) => void;
  toggleOption: (option: Option) => void;
  handleEditCategoryName: (catId: number) => void;
  handleMakeRequiredCat: (catId: number) => void;
  handleOnlyOneCat: (catId: number) => void;
  handleDeleteCategory: (catId: number) => void;
  handleAddIngredient: (catId: number) => void;
  handleEditIngredientName: (catId: number, ingId: number) => void;
  handleEditIngredientPrice: (catId: number, ingId: number, price: number) => void;
  handleDeleteIngredient: (catId: number, ingId: number) => void;
  handleEditOptionQuestion: (optId: number) => void;
  handleEditOptionPrice: (optId: number) => void;
  handleEditOptionComment: (optId: number) => void;
  handleDeleteOption: (optId: number) => void;
  handleAddCategory: () => void;
  handleAddOption: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  fullProduct,
  business,
  selectedIngredients,
  selectedOptions,
  openCategories,
  openOptions,
  setOpenOptions,
  toggleCategory,
  toggleIngredient,
  toggleOption,
  handleEditCategoryName,
  handleMakeRequiredCat,
  handleOnlyOneCat,
  handleDeleteCategory,
  handleAddIngredient,
  handleEditIngredientName,
  handleEditIngredientPrice,
  handleDeleteIngredient,
  handleEditOptionQuestion,
  handleEditOptionPrice,
  handleEditOptionComment,
  handleDeleteOption,
  handleAddCategory,
  handleAddOption,
}) => {
  return (
    <div className="p-6">
      {/* Product Title & Price */}
      <div className="flex justify-between mb-2 items-center">
        <h2 className="text-4xl font-bold">{fullProduct.name}</h2>
        <p className="font-bold text-yellow-600 text-2xl mt-0.5 flex items-center gap-2">
          {fullProduct.offer && fullProduct.offerPrice ? (
            <>
              <span>{Number(fullProduct.price).toFixed(2)}€</span>
              <span className="line-through text-gray-400">
                {Number(fullProduct.offerPrice).toFixed(2)}€
              </span>
            </>
          ) : (
            <span>{Number(fullProduct.price).toFixed(2)}€</span>
          )}
        </p>
      </div>

      <p className="text-gray-700 text-base leading-relaxed mb-4">
        {fullProduct.description}
      </p>

      {/* Ingredient Categories */}
      {fullProduct.ingCategories
        ?.filter((ingCat) => !ingCat.delete)
        .map((ingCat) => {
          const open = openCategories[ingCat.id] ?? false;

          return (
            <div
              key={ingCat.id}
              id={`ing-cat-${ingCat.id}`}
              className="mb-4 border rounded-lg shadow-sm bg-white"
            >
              {/* Header */}
              <div
                onClick={() => toggleCategory(ingCat.id)}
                className={`flex justify-between items-center px-3 py-2 cursor-pointer transition 
                  ${open ? 'bg-gray-200 rounded-t-lg' : 'bg-gray-100 rounded-lg hover:bg-gray-200'}`}
              >
                <div className="flex items-center gap-2">
                  {open ? (
                    <ChevronDown className="w-7 h-7 sm:w-5 sm:h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-7 h-7 sm:w-5 sm:h-5 text-gray-600" />
                  )}
                  <h3 className="font-bold text-lg text-gray-800">{ingCat.name}</h3>
                  {ingCat.isRequired && (
                    <span className="ml-2 text-xs font-medium bg-orange-200 text-orange-800 px-2 py-0.5 rounded">
                      Υποχρεωτικό
                    </span>
                  )}
                </div>
                {business && (
                  <div
                    className="p-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    title="Επεξεργασία Κατηγορίας"
                  >
                    <Pencil size={20} />
                  </div>
                )}
              </div>

              {/* Collapsible Ingredients */}
              {open && (
                <div className="px-2 py-2 space-y-2">
                  {business && (
                    <div className="flex justify-between flex-wrap gap-1">
                      <p>Επεξεργασία:</p>
                      <div className="flex gap-1 justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategoryName(ingCat.id);
                          }}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm"
                          title="Επεξεργασία Κατηγορίας"
                        >
                          Όνομα
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMakeRequiredCat(ingCat.id);
                          }}
                          className={`px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm`}
                          title={ingCat.isRequired ? "Κάνε Προαιρετική" : "Κάνε Υποχρεωτική"}
                        >
                          {ingCat.isRequired ? "Προαιρετική" : "Υποχρεωτική"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOnlyOneCat(ingCat.id);
                          }}
                          className={`px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm`}
                          title={ingCat.onlyOne ? "Μόνο μία επιλογή" : "Μόνο μία επιλογή"}
                        >
                          {ingCat.onlyOne ? "Επιτρεπόμενες επιλογές: Όλες" : "Επιτρεπόμενες επιλογές: Μία"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(ingCat.id);
                          }}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm"
                          title="Διαγραφή Κατηγορίας"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  {ingCat.ingredients.map((ing) => (
                    <label
                      key={ing.id}
                      className="flex items-center gap-3 border rounded-md p-2 bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIngredients.some((i) => i.id === ing.id)}
                        onChange={() => toggleIngredient(ing, ingCat)}
                        className="h-4 w-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{ing.name}</p>
                        {ing.price > 0 && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Plus className="w-3 h-3" />{Number(ing.price).toFixed(2)}€
                          </p>
                        )}
                      </div>
                      {business && ( 
                        <div className="flex gap-1"> 
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditIngredientName(ingCat.id, ing.id); }} 
                            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm" 
                            title="Επεξεργασία Ερώτησης" 
                          > 
                            Όνομα 
                          </button> 
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEditIngredientPrice(ingCat.id, ing.id, ing.price); }} 
                            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm" 
                            title="Edit Price" 
                          > 
                            Τιμή 
                          </button> 
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteIngredient(ingCat.id, ing.id); }} 
                            className="px-2 py-1 bg-gray-300 hover:bg-gray-400 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm" 
                            title="Διαγραφή Κατηγορίας" 
                          > 
                            <Trash2 className="w-4 h-4" /> 
                          </button> 
                        </div> 
                      )}
                    </label>
                  ))}

                  {business && (
                    <button
                      onClick={() => handleAddIngredient(ingCat.id)}
                      className="px-2 py-1 flex items-center gap-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                    >
                      <Plus className="w-4 h-4" /><p> Προσθήκη Συστατικού</p>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

      {/* Options */}
      {fullProduct.options
        ?.filter((opt) => !opt.delete)
        .map((opt) => {
          const open = openOptions[opt.id] ?? false;
          return (
            <div
              key={opt.id}
              id={`opt-${opt.id}`}
              className="mb-4 border rounded-lg shadow-sm bg-white"
            >
              <div
                onClick={() =>
                  setOpenOptions((prev) => ({ ...prev, [opt.id]: !prev[opt.id] }))
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

                {business && (
                  <div
                    className="p-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                    title="Επεξεργασία Κατηγορίας"
                  >
                    <Pencil size={20} />
                  </div>
                )}
              </div>

              {open && (
                <div className="p-2 space-y-2">
                  {business && ( 
                    <div className="flex gap-1 justify-between"> {/* Edit Question */} 
                      <p>Επεξεργασία:</p>
                      <div className="flex gap-1 justify-between">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditOptionQuestion(opt.id); }} 
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm" 
                          title="Επεξεργασία Ερώτησης" 
                        > 
                          Όνομα 
                        </button> {/* Edit Price */} 
                        <button   
                          onClick={(e) => { e.stopPropagation(); handleEditOptionPrice(opt.id); }} 
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm" 
                          title="Edit Price" 
                        > 
                          Τιμή 
                        </button> {/* Edit Comment */} 
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditOptionComment(opt.id); }} 
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm" 
                          title="Επεξεργασία Σχολίου" 
                        > 
                          Προϊόν 
                        </button> {/* Delete Option */} 
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteOption(opt.id); }} 
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-black rounded-md text-xs font-semibold transition-shadow shadow-sm" 
                          title="Διαγραφή Επιλογής" 
                        > 
                          <Trash2 className="w-4 h-4" /> 
                        </button> 
                      </div>
                    </div> 
                  )}
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`option-${opt.id}`}
                      checked={selectedOptions.some((i) => i.id === opt.id)}
                      onChange={() => toggleOption(opt)}
                    />
                    Ναι
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name={`option-${opt.id}`}
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

      {business && (
        <div className="flex justify-between mt-4">
          <button
            onClick={handleAddCategory}
            className="px-2 py-2 flex items-center gap-2 mr-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 text-base"
          >
            <Plus className="w-5 h-5" /> <p>Προσθήκη Κατηγορίας</p>
          </button>
          <button
            onClick={handleAddOption}
            className="px-2 py-2 flex items-center gap-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 text-base"
          >
            <Plus className="w-5 h-5" /> <p>Προσθήκη Επιλογής</p>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
