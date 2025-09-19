// components/PaymentModal.tsx
"use client";

import React from "react";

type OrderItem = {
  id: number;
  product: { id: number; name: string };
  quantity: number;
  price: number;
  ingredients?: { id: number; name: string; price: number }[];
};

type User = {
  id: number;
  name: string;
  address?: string;
};

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderItems: OrderItem[];
  total: number;
  user: User | null;
};

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  orderItems,
  total,
  user,
}: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-11/12 max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4">Επιβεβαίωση Παραγγελίας</h2>

        <p className="mb-2">
          <strong>Διεύθυνση:</strong> {user?.address || "Δεν έχει οριστεί"}
        </p>

        <div className="mb-4 max-h-60 overflow-y-auto">
          {orderItems.map((item) => (
            <div key={item.id} className="flex justify-between mb-1">
              <div>
                {item.quantity} x {item.product.name}
                {item.ingredients && item.ingredients.length > 0 && (
                  <ul className="ml-2 text-sm text-gray-600">
                    {item.ingredients.map((ing) => (
                      <li key={ing.id}>+ {ing.name} - €{ing.price}</li>
                    ))}
                  </ul>
                )}
              </div>
              <span>€{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <p className="font-bold mb-4">Σύνολο: €{total}</p>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Ακύρωση
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Ολοκλήρωση Πληρωμής
          </button>
        </div>
      </div>
    </div>
  );
}
