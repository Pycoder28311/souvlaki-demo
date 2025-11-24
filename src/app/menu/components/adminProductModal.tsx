"use client";

import React, { RefObject, useState } from "react";
import { Product } from "../../types"; // make sure you import your interface
import { Pencil, Save, Trash2, X } from "lucide-react";
import Intervals from "@/app/schedule-manage/intervalsEditor";

interface AdminProductModalProps {
  product: Product;
  modalRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onEditName: (id: number, categoryId: number, name: string) => void;
  onDelete: (id: number, categoryId: number) => void;
  onToggleOffer: (id: number, categoryId: number, offer: boolean, price: number, newOfferPrice: number) => void;
  onEditDescription: (id: number, newDescription: string) => void;
  onEditPrice: (id: number, newPrice: number) => void;
  confirmingDelete: number | null;
  setConfirmingDelete: React.Dispatch<React.SetStateAction<number | null>>;
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
  confirmingDelete,
  setConfirmingDelete,
}) => {
  const [intervals, setIntervals] = useState(product.intervals)

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(product.name);

  const handleChangeName = () => {
    if (newName !== product.name) {
      onEditName(product.id, product.categoryId || 0, newName);
    }
    setIsEditing(false);
  };

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [newDescription, setNewDescription] = useState(product.description);

  const handleChangeDescription = () => {
    if (newDescription !== product.description) {
      onEditDescription(product.id, newDescription);
    }
    setIsEditingDescription(false);
  };

  const [isEditingOffer, setIsEditingOffer] = useState(false);
  const [offerPrice, setOfferPrice] = useState(product.offerPrice || 0);

  const handleConfirm = () => {
    const newPrice = offerPrice;
    if (isNaN(newPrice) || newPrice <= 0) return alert("Η τιμή προσφοράς πρέπει να είναι αριθμός μεγαλύτερος από 0");
    onToggleOffer(product.id, product.categoryId || 0, product.offer, product.price, newPrice);
    setIsEditingOffer(false);
  };

  const handleCancel = () => {
    setIsEditingOffer(false);
    setOfferPrice(product.offerPrice || 0);
  };

  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);

  const [offer, setOffer] = useState(product.offer);
  const [price, setPrice] = useState(product.price);

  // generate hour options 00-23
  if (!product) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-2xl shadow-xl w-[90%] sm:w-[500px] relative mt-16
                  max-h-[80vh] overflow-y-auto"
        style={{
          maxHeight: '80vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin', // για Firefox
          scrollbarColor: '#9ca3af #e5e7eb', // thumb color / track color
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          ✕
        </button>

        <div className="flex gap-2 flex-row items-center justify-center mb-4">
          {isEditing ? (
            <>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-center text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </>
          ) : (
            <h3 className="text-2xl font-semibold text-center">
              {newName}
            </h3>
          )}

          <button
            onClick={() => {
              if (isEditing) {
                handleChangeName();
              } else {
                setIsEditing(true);
              }
            }}
            className="py-1 px-2 text-black rounded-lg hover:bg-gray-200 transition-transform font-medium"
          >
            {isEditing ? (
              <Save size={18} className="inline" />
            ) : (
              <Pencil size={18} className="inline" />
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full justify-between mb-4">
          <div className="flex items-start justify-start md:justify-center">
            {editingPriceId === product.id ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-800 font-semibold">Τιμή:</span>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                  className="w-12 border rounded-lg px-2 py-1 text-sm"
                  placeholder="Νέα Τιμή"
                />
                <button
                  onClick={() => {
                    if (isNaN(newPrice) || newPrice <= 0) return alert("Η τιμή πρέπει να είναι μεγαλύτερη από 0");
                    if (newPrice !== product.price) {
                      onEditPrice(product.id, newPrice);
                    }
                    setPrice(newPrice)
                    setEditingPriceId(null);
                  }}
                  className="px-2 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded-lg text-sm"
                >
                  <Save className="w-4 h-4 text-black" />
                </button>
              </div>
            ) : (
              <div className="flex items-center w-full gap-2 justify-start md:justify-center">
                <span className="text-gray-800 font-semibold">Τιμή: {Number(price).toFixed(2)} €</span>
                <button
                  onClick={() => {
                    setEditingPriceId(product.id);
                    setNewPrice(product.price); // prefill with current price
                  }}
                  className="px-2 py-2 flex items-center justify-center text-black rounded-lg hover:bg-gray-200 transition"
                >
                  <Pencil size={16} className="inline" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditingOffer ? (
              <>
                <button
                  onClick={() => {
                    if (offer) {
                      // Directly disable offer
                      onToggleOffer(product.id, product.categoryId || 0, product.offer, product.price, offerPrice);
                      setOffer(!product.offer)
                    } else {
                      // Start editing mode
                      setIsEditingOffer(true);
                    }
                  }}
                  className={`rounded-lg transition text-blue-500 hover:underline hover:text-blue-600 justify-start md:justify-center`}
                >
                  {offer ? "Αφαίρεση Προσφοράς" : "Ορισμός ως Προσφορά"}
                </button>
              </>
            ) : (
              <div className="flex flex-row items-center gap-2 justify-start md:justify-center">
                  <p>Νέα Τιμή:</p>
                  <input
                    type="number"
                    placeholder="Νέα τιμή"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                    className="w-12 border rounded-lg px-2 py-1 text-sm"
                  />

                  <button
                    onClick={() => {
                      if (offerPrice !== product.offerPrice) {
                        handleConfirm()
                        setOffer(!offer)
                      } else {
                        handleCancel()
                      }
                    }}
                    className="px-2 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded-lg text-sm flex items-center gap-1"
                  >
                    <Save className="w-4 h-4 text-black" />
                  </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-col items-start justify-center mb-2">
          <div className="flex items-center gap-2">
            <strong>Περιγραφή</strong>
            <button
              onClick={() => {
                if (isEditingDescription) {
                  handleChangeDescription();
                } else {
                  setIsEditingDescription(true);
                }
              }}
              className="py-1 px-2 text-black rounded-lg hover:bg-gray-200 transition-transform font-medium"
            >
              {isEditingDescription ? (
                <Save size={16} className="inline" />
              ) : (
                <Pencil size={16} className="inline" />
              )}
            </button>
          </div>
          {isEditingDescription ? (
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
              rows={4} // adjust height
              placeholder="Εισάγετε την περιγραφή..."
            />
          ) : (
            <h3 className="text-md">
              {newDescription}
            </h3>
          )}
        </div>

        <Intervals days={["default"]} object="product" id={product.id} intervals={intervals} setIntervals={setIntervals}/>

        <div className="flex items-center gap-2 mt-6">
          {confirmingDelete !== product.id ? (
            <button
              onClick={() => setConfirmingDelete(product.id)}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-transform font-medium"
            >
              Διαγραφή Προϊόντος
              <Trash2 size={18} className="inline ml-2" />
            </button>
          ) : (
            <div className="flex w-full flex-row justify-center gap-2">
              <button
                onClick={() => onDelete(product.id, product.categoryId || 0)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Είστε σίγουροι;
              </button>
              <button
                onClick={() => setConfirmingDelete(null)}
                className="py-2 px-4 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-transform font-medium flex items-center gap-2 justify-center"
              >
                Ακύρωση <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductModal;
