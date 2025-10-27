"use client";

import React, { RefObject, useState, useEffect } from "react";
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

  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // if initialHours change, update state
    const o = parse(category?.openHour)
    const c = parse(category?.closeHour)
    setOpenHour(o.hh); 
    setOpenMin(o.mm)
    setCloseHour(c.hh); 
    setCloseMin(c.mm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.openHour, category?.closeHour])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const open = `${openHour}:${openMin}`
    const close = `${closeHour}:${closeMin}`

    // simple validation: open < close? (optional)
    const openT = parseInt(openHour) * 60 + parseInt(openMin)
    const closeT = parseInt(closeHour) * 60 + parseInt(closeMin)
    if (openT >= closeT) {
      return
    }

    setIsSaving(true)
    try {
      const res = await fetch(`/api/update-category-hours/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open, close }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || 'Σφάλμα στο API')
      }
      setTimeout(() => window.location.reload(), 500)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-full">
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

            {openHour === '00' && openMin === '00' && closeHour === '23' && closeMin === '59' && !category.alwaysClosed && (
              <p className="text-green-600 text-sm font-medium">
                Η κατηγορία είναι διαθέσιμη όλες τις ώρες
              </p>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? 'Αποθήκευση...' : 'Αποθήκευση Ωραρίου'}
            </button>

            <button
              onClick={async () => {
                try {
                  await fetch(`/api/availability-categories/${category.id}`, {
                    method: 'PUT',
                  })
                  setTimeout(() => window.location.reload(), 500)
                } catch (err) {
                  console.error(err)
                }
              }}
              className={`p-2 rounded-lg transition ${
                category.alwaysClosed ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
              title="Toggle Availability"
            >{category.alwaysClosed 
              ? 'Διαθέσιμη τις ώρες που ορίζω' 
              : 'Μη διαθέσιμη (κάνε κλικ για επεξεργασία)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryModal;
