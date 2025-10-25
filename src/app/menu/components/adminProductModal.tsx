import React, { RefObject } from "react";
import { Product } from "../../types"; // make sure you import your interface

interface AdminProductModalProps {
  product: Product;
  modalRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onEditName: (id: number, name: string) => void;
  onDelete: (id: number, name: string) => void;
  onToggleOffer: (id: number, offer: boolean, price: number) => void;
  onEditDescription: (id: number) => void;
  onEditPrice: (id: number) => void;
}

const AdminProductModal: React.FC<AdminProductModalProps> = ({
  product,
  modalRef,
  onClose,
  onEditName,
  onDelete,
  onToggleOffer,
  onEditDescription,
  onEditPrice,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-2xl shadow-xl w-[90%] sm:w-[400px] relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-4 text-center">
          Ενέργειες Προϊόντος: {product.name}
        </h3>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onEditName(product.id, product.name)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
          >
            Επεξεργασία Ονόματος
          </button>

          <button
            onClick={() => onDelete(product.id, product.name)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Διαγραφή Προϊόντος
          </button>

          <button
            onClick={() =>
              onToggleOffer(product.id, product.offer, product.price)
            }
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            {product.offer ? "Αφαίρεση Προσφοράς" : "Ορισμός Προσφοράς"}
          </button>

          <button
            onClick={() => onEditDescription(product.id)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Επεξεργασία Περιγραφής
          </button>

          <button
            onClick={() => onEditPrice(product.id)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Επεξεργασία Τιμής
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProductModal;
