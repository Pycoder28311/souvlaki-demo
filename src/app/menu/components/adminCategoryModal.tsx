"use client";

import React, { RefObject, useState, useEffect } from "react";
import { Category } from "../../types"; // your Category interface
import { X, Plus, Trash2, Save, Pencil } from "lucide-react";
import { FormEvent } from "react";

interface CategoryModalProps {
  category: Category;
  modalRef?: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  moveCategory: (id: number, direction: "up" | "down") => void;
  saveCategoryPositions: () => void;
  handleCreateProduct: (categoryId: number, name: string, description: string, price: number) => void;
  handleEditCategory: (categoryId: number, name: string) => void;
  handleDeleteCategory: (categoryId: number) => void;
  toggleCategoryAvailability: (categoryId: number) => void;
  handleSubmit: (e: React.FormEvent, openHour: string, openMin: string, closeHour: string, closeMin: string, setIsSaving: (isSaving: boolean) => void, category: Category) => void;
  confirmingDelete: number | null;
  setConfirmingDelete: React.Dispatch<React.SetStateAction<number | null>>;
}

function two(n: number): string {
  return n < 10 ? '0' + n : String(n)
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
  toggleCategoryAvailability,
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

  const initOpen = parse(category?.openHour)
  const initClose = parse(category?.closeHour)

  const [openHour, setOpenHour] = useState(initOpen.hh)
  const [openMin, setOpenMin] = useState(initOpen.mm)
  const [closeHour, setCloseHour] = useState(initClose.hh)
  const [closeMin, setCloseMin] = useState(initClose.mm)

  const [isSaving, setIsSaving] = useState(false);
  const handleFormSubmitWrapper = (e: FormEvent<HTMLFormElement>) => {
    handleSubmit(
      e,
      openHour,
      openMin,
      closeHour,
      closeMin,
      setIsSaving,
      category
    );
  };

  const [availability, setAvailability] = useState(category.alwaysClosed)

  useEffect(() => {
    // if initialHours change, update state
    const o = parse(category?.openHour)
    const c = parse(category?.closeHour)
    setOpenHour(o.hh); 
    setOpenMin(o.mm)
    setCloseHour(c.hh); 
    setCloseMin(c.mm)
  }, [category?.openHour, category?.closeHour])

  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(category.name);

  const handleChangeName = () => {
    if (newName !== category.name) {
      handleEditCategory(category.id, newName);
    }
    setIsEditing(false);
  };

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleAddProduct = (categoryId: number) => {
    handleCreateProduct(categoryId, name, description, Number(price));
    setIsCreating(false);
    setName("");
    setDescription("");
    setPrice("")
  };

  // generate hour options 00-23
  const hours = Array.from({ length: 24 }).map((_, i) => two(i))
  if (!category) return null;

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
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={22} />
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

        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row justify-between w-full gap-2 sm:gap-0">
            <div className="flex justify-between w-full sm:w-auto gap-2">
              <button
                onClick={() => moveCategory(category.id, "up")}
                className="px-4 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-transform text-lg sm:text-base"
              >
                ▲ Πάνω
              </button>
              <button
                onClick={() => moveCategory(category.id, "down")}
                className="px-4 py-2 bg-blue-200 rounded-lg hover:bg-blue-300 transition-transform text-lg sm:text-base"
              >
                ▼ Κάτω
              </button>
            </div>

            <button
              onClick={saveCategoryPositions}
              className="px-4 py-2 bg-blue-500 flex items-center justify-center gap-2 text-white rounded-lg hover:bg-blue-600 transition-transform font-medium text-lg sm:text-base"
            >
              Ενημέρωση Θέσεων
              <Save className="w-5 h-5 text-gray-100" />
            </button>
          </div>

          <div className="w-full flex flex-col gap-2">
            {isCreating && (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={name}
                  placeholder="Όνομα προϊόντος"
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  value={description}
                  placeholder="Περιγραφή"
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                  type="text"
                  value={price}
                  placeholder="Τιμή"
                  onChange={(e) => setPrice(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  if (isCreating) handleAddProduct(category.id);
                  else setIsCreating(true);
                }}
                className="flex-1 py-2 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 transition-transform font-medium flex items-center justify-center"
              >
                {isCreating ? "Αποθήκευση" : "Δημιουργία Προϊόντος"}
                {isCreating ? <Save size={18} className="inline ml-2" /> : <Plus size={18} className="inline ml-2" />}
              </button>
              {isCreating && (
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setName("");
                    setDescription("");
                    setPrice("");
                  }}
                  className="flex-1 py-2 bg-gray-200 text-black text-lg rounded-lg hover:bg-gray-300 transition-transform font-medium flex items-center gap-2 justify-center"
                >
                  Ακύρωση <X size={18} />
                </button>
              )}
            </div>
          </div>
          
          {!availability && (
            <form onSubmit={handleFormSubmitWrapper} className="flex flex-col gap-4 max-w-full">
              <p className="text-md font-semibold text-start mt-4">Διαθεσιμότητα</p>
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
                      className="border rounded p-2 flex-2"
                      aria-label="Ώρα έναρξης - λεπτά"
                    >
                      {minuteOptions
                        .filter((m) => openHour === '23' || m !== '59')
                        .map((m) => (
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
                      className="border rounded p-2 flex-2"
                      aria-label="Ώρα λήξης - λεπτά"
                    >
                      {minuteOptions
                        .filter((m) => closeHour === '23' || m !== '59')
                        .map((m) => (
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
                className="bg-blue-500 flex items-center justify-center gap-2 text-white text-lg py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Ωραρίου'}
                <Save className="w-5 h-5 text-gray-100" />
              </button>
            </form>
          )}
          
          <div className="flex items-center w-full justify-between">
            {openHour === '00' && openMin === '00' && closeHour === '23' && closeMin === '59' && !availability && (
              <p className="text-green-600 text-sm font-medium">
                Η κατηγορία είναι διαθέσιμη όλες τις ώρες
              </p>
            )}

            <button
              onClick={() => {toggleCategoryAvailability(category.id); setAvailability(!availability)}}
              className={`rounded-lg transition text-blue-500 hover:underline hover:text-blue-600`}
              title="Toggle Availability"
            >
              {availability
                ? 'Διαθέσιμη τις ώρες που ορίζω' 
                : 'Κάνε την μη διαθέσιμη'}
            </button>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {confirmingDelete !== category.id ? (
              <button
                onClick={() => setConfirmingDelete(category.id)}
                className="w-full py-2 bg-red-500 text-white text-lg rounded-lg hover:bg-red-600 transition-transform font-medium"
              >
                Διαγραφή Κατηγορίας
                <Trash2 size={18} className="inline ml-2" />
              </button>
            ) : (
              <div className="flex w-full flex-row justify-center gap-2">
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-lg px-4 py-2 rounded-lg"
                >
                  Είστε σίγουροι;
                </button>
                <button
                  onClick={() => setConfirmingDelete(null)}
                  className="py-2 px-4 bg-gray-200 text-black text-lg rounded-lg hover:bg-gray-300 transition-transform font-medium flex items-center gap-2 justify-center"
                >
                  Ακύρωση <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryModal;
