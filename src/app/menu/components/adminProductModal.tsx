"use client";

import React, { RefObject, useState, useEffect } from "react";
import { Product } from "../../types"; // make sure you import your interface
import { Edit2, Pencil, Save, Trash2, X } from "lucide-react";
import { Check, Tag } from "lucide-react";
import { FormEvent } from "react";

interface AdminProductModalProps {
  product: Product;
  modalRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onEditName: (id: number, categoryId: number, name: string) => void;
  onDelete: (id: number, categoryId: number) => void;
  onToggleOffer: (id: number, categoryId: number, offer: boolean, price: number, newOfferPrice: number) => void;
  onEditDescription: (id: number, newDescription: string) => void;
  onEditPrice: (id: number, newPrice: number) => void;
  handleSubmit: (e: React.FormEvent, openHour: string, openMin: string, closeHour: string, closeMin: string, setIsSaving: (isSaving: boolean) => void, product: Product, categoryId: number) => void;
  confirmingDelete: boolean;
  setConfirmingDelete: React.Dispatch<React.SetStateAction<boolean>>;
  toggleProductAvailability: (productId: number, categoryId: number) => void;
}

function two(n: number): string {
  return n < 10 ? '0' + n : String(n)
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
  toggleProductAvailability,
  handleSubmit,
  confirmingDelete,
  setConfirmingDelete,
}) => {

  const minuteOptions = ['00', '15', '30', '45', '59']
  
  // parse initial HH:MM into parts
  const parse = (t?: string) => {
    if (!t) return { hh: '09', mm: '00' }
    const [hh = '09', mm = '00'] = t.split(':')
    return { hh: two(Number(hh)), mm: mm.padStart(2, '0') }
  }

  const initOpen = parse(product?.openHour)
  const initClose = parse(product?.closeHour)

  const [openHour, setOpenHour] = useState(initOpen.hh)
  const [openMin, setOpenMin] = useState(initOpen.mm)
  const [closeHour, setCloseHour] = useState(initClose.hh)
  const [closeMin, setCloseMin] = useState(initClose.mm)

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // if initialHours change, update state
    const o = parse(product?.openHour)
    const c = parse(product?.closeHour)
    setOpenHour(o.hh); 
    setOpenMin(o.mm)
    setCloseHour(c.hh); 
    setCloseMin(c.mm)
  }, [product?.openHour, product?.closeHour])

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

  const handleFormSubmitWrapper = (e: FormEvent<HTMLFormElement>) => {
    handleSubmit(
      e,
      openHour,
      openMin,
      closeHour,
      closeMin,
      setIsSaving,
      product,
      product.categoryId || 0,
    );
  };

  const [availability, setAvailability] = useState(product.alwaysClosed);
  const [offer, setOffer] = useState(product.offer);
  const [price, setPrice] = useState(product.price);

  // generate hour options 00-23
  const hours = Array.from({ length: 24 }).map((_, i) => two(i))
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

        <div className="flex gap-2 flex-col items-center justify-center mb-4">
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
            <>
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </>
          ) : (
            <h3 className="text-lg">
              {newDescription}
            </h3>
          )}
        </div>

        <div className="flex items-center justify-center mb-4 w-full">
          {editingPriceId === product.id ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-800 font-medium">Τιμή:</span>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                className="w-24 border rounded-lg px-2 py-1 text-sm"
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
            <div className="flex items-center w-full gap-2 justify-center">
              <span className="text-gray-800 font-medium">Τιμή: {Number(price).toFixed(2)} €</span>
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

        {isEditingOffer && (<strong className="flex w-full justify-center mb-2">Προσφορά</strong>)}

        <div className="flex items-center gap-2 mb-4">
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
                className={`rounded-lg transition text-blue-500 hover:underline hover:text-blue-600 w-full justify-center`}
              >
                {offer ? "Αφαίρεση Προσφοράς" : "Ορισμός ως Προσφορά"}
              </button>
            </>
          ) : (
            <div className="flex flex-row items-center gap-2 justify-center w-full">
                <p>Νέα Τιμή:</p>
                <input
                  type="number"
                  placeholder="Νέα τιμή"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-24 border rounded-lg px-2 py-1 text-sm"
                />

                <button
                  onClick={() => {
                    if (offerPrice !== product.offerPrice) {
                      handleConfirm()
                    } else {
                      handleCancel()
                    }
                    setOffer(!offer)
                  }}
                  className="px-2 py-2 bg-gray-300 hover:bg-gray-400 text-white rounded-lg text-sm flex items-center gap-1"
                >
                  <Save className="w-4 h-4 text-black" />
                </button>
            </div>
          )}
        </div>
        
        {!availability && (
          <form onSubmit={handleFormSubmitWrapper} className="flex flex-col gap-4 max-w-full">
            <p className="text-md font-semibold text-center mt-4">Διαθεσιμότητα</p>
            <div className="flex gap-4">
              <label className="flex flex-col flex-1">
                <span className="mb-1 text-sm font-medium text-gray-700">Ώρα Έναρξης</span>
                <div className="flex gap-2">
                  <select
                    value={openHour}
                    onChange={(e) => setOpenHour(e.target.value)}
                    className="border rounded p-2 flex-1"
                    aria-label="Ώρα έναρξης - ώρα"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <select
                    value={openMin}
                    onChange={(e) => setOpenMin(e.target.value)}
                    className="border rounded p-2 w-24"
                    aria-label="Ώρα έναρξης - λεπτά"
                  >
                    {minuteOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className="flex flex-col flex-1">
                <span className="mb-1 text-sm font-medium text-gray-700">Ώρα Λήξης</span>
                <div className="flex gap-2">
                  <select
                    value={closeHour}
                    onChange={(e) => setCloseHour(e.target.value)}
                    className="border rounded p-2 flex-1"
                    aria-label="Ώρα λήξης - ώρα"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>

                  <select
                    value={closeMin}
                    onChange={(e) => setCloseMin(e.target.value)}
                    className="border rounded p-2 w-24"
                    aria-label="Ώρα λήξης - λεπτά"
                  >
                    {minuteOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-500 flex items-center justify-center gap-2 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Ωραρίου'}
              <Save className="w-5 h-5 text-gray-100" />
            </button>
          </form>
        )}

        <div className="flex items-center justify-between w-full mt-3">
          {openHour === '00' && openMin === '00' && closeHour === '23' && closeMin === '59' && !availability && (
            <p className="text-green-600 text-sm font-medium">
              Το προϊόν είναι διαθέσιμο όλες τις ώρες
            </p>
          )}

          <button
            onClick={() => {toggleProductAvailability(product.id, product.categoryId || 0); setAvailability(!availability)}}
            className={`rounded-lg transition text-blue-500 hover:underline hover:text-blue-600`}
            title="Toggle Availability"
          >
            {availability
              ? 'Διαθέσιμη τις ώρες που ορίζω' 
              : 'Κάνε την μη διαθέσιμη'}
          </button>
        </div>

        <div className="flex items-center gap-2 mt-6">
          {!confirmingDelete ? (
            <button
              onClick={() => setConfirmingDelete(true)}
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
                onClick={() => setConfirmingDelete(false)}
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
