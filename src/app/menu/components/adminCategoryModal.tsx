import React, { RefObject } from "react";
import { Category } from "../../types"; // your Category interface
import { X, Plus, Edit2, Trash2 } from "lucide-react";

interface CategoryModalProps {
  category: Category;
  modalRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  moveCategory: (id: number, direction: "up" | "down") => void;
  saveCategoryPositions: () => void;
  handleCreateProduct: (categoryId: number) => void;
  handleEditCategory: (categoryId: number, name: string) => void;
  handleDeleteCategory: (categoryId: number, name: string) => void;
}

const AdminCategoryModal: React.FC<CategoryModalProps> = ({
  category,
  modalRef,
  onClose,
  moveCategory,
  saveCategoryPositions,
  handleCreateProduct,
  handleEditCategory,
  handleDeleteCategory,
}) => {
  if (!category) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-2xl shadow-xl w-[90%] sm:w-[500px] relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={22} />
        </button>

        <h3 className="text-xl font-semibold mb-4 text-center">
          Επεξεργασία Κατηγορίας: {category.name}
        </h3>

        <div className="flex flex-col gap-3">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => moveCategory(category.id, "up")}
              className="px-4 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-transform transform hover:scale-110"
            >
              ▲ Πάνω
            </button>
            <button
              onClick={() => moveCategory(category.id, "down")}
              className="px-4 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-transform transform hover:scale-110"
            >
              ▼ Κάτω
            </button>
          </div>

          <button
            onClick={saveCategoryPositions}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-transform transform hover:scale-105 font-medium"
          >
            Ενημέρωση Θέσεων
          </button>

          <button
            onClick={() => handleCreateProduct(category.id)}
            className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105 font-medium"
          >
            <Plus size={18} className="inline mr-2" />
            Δημιουργία Προϊόντος
          </button>

          <button
            onClick={() => handleEditCategory(category.id, category.name)}
            className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-transform transform hover:scale-105 font-medium"
          >
            <Edit2 size={18} className="inline mr-2" />
            Επεξεργασία Ονόματος
          </button>

          <button
            onClick={() => handleDeleteCategory(category.id, category.name)}
            className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105 font-medium"
          >
            <Trash2 size={18} className="inline mr-2" />
            Διαγραφή Κατηγορίας
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryModal;
