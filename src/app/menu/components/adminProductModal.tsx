"use client";

import React, { RefObject, useState, useEffect } from "react";
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
    setOpenHour(o.hh); setOpenMin(o.mm)
    setCloseHour(c.hh); setCloseMin(c.mm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.openHour, product?.closeHour])

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
      const res = await fetch(`/api/update-product-hours/${product.id}`, {
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

            {openHour === '00' && openMin === '00' && closeHour === '23' && closeMin === '59' && !product.alwaysClosed && (
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
                  await fetch(`/api/availability-products/${product.id}`, {
                    method: 'PUT',
                  })
                  setTimeout(() => window.location.reload(), 500)
                } catch (err) {
                  console.error(err)
                }
              }}
              className={`p-2 rounded-lg transition ${
                product.alwaysClosed ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
              title="Toggle Availability"
            >{product.alwaysClosed 
              ? 'Διαθέσιμο τις ώρες που ορίζω' 
              : 'Μη διαθέσιμο (κάνε κλικ για επεξεργασία)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminProductModal;
