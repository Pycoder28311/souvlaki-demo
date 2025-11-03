"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import CheckOutForm from "../../../z-components/checkOut";
import { User, OrderItem } from "../../../types"; 
import { useRouter } from "next/navigation";

interface PaymentWayModalProps {
  paymentWayModal: boolean;
  setPaymentWayModal: (val: boolean) => void;
  total: number;
  user: User | null;
  orderItems: OrderItem[];
  removeItem: (item: OrderItem) => void;
  setIsSidebarOpen: (val: boolean) => void;
  isTooFar: boolean;
  formLoaded: boolean;
  setFormLoaded: (val: boolean) => void;
  paymentWay: string;
  setPaymentWay: (val: string) => void;
  handleClickDoor: (
    router: ReturnType<typeof import("next/navigation").useRouter>,
    paidIn: string,
    user: User | null,
    orderItems: OrderItem[],
    removeItem: (item: OrderItem) => void,
    setIsSidebarOpen: (val: boolean) => void,
    setShowPaymentModal: (val: boolean) => void,
  ) => void;
  setShowPaymentModal: (val: boolean) => void;
}

const PaymentWayModal: React.FC<PaymentWayModalProps> = ({
  paymentWayModal,
  setPaymentWayModal,
  total,
  user,
  orderItems,
  removeItem,
  setIsSidebarOpen,
  isTooFar,
  formLoaded,
  setFormLoaded,
  paymentWay,
  setPaymentWay,
  handleClickDoor,
  setShowPaymentModal,
}) => {
  const router = useRouter();

  if (!paymentWayModal) return null;

  const isDisabled = !!isTooFar;
  const disabledClasses = "opacity-50 pointer-events-none";

  return (
    <div className="fixed mb-12 sm:mb-0 w-full inset-0 bg-opacity-50 z-60 flex justify-center items-center">
      <div className="bg-gray-100 w-full h-full max-h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center border-b border-gray-300 px-2 pt-4 pb-4">
          <button
            onClick={() => {
              setPaymentWayModal(false);
              setFormLoaded(false);
            }}
            className="p-2 rounded-lg hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h2 className="text-xl font-bold text-gray-800 ml-3">Τρόπος Πληρωμής</h2>
        </div>

        {/* Bottom Section */}
        <div className="pb-6 border-gray-300 mt-auto px-6">
          {/* Total */}
          <p className="mb-4 font-bold text-gray-900 text-xl px-1 pt-4">
            Σύνολο: {total.toFixed(2)}€
          </p>

          {/* Checkout Form */}
          <div>
            <CheckOutForm
              amount={total}
              userId={user?.id}
              items={orderItems}
              paidIn={paymentWay}
              isDisabled={isDisabled}
              removeItem={removeItem}
              setIsSidebarOpen={setIsSidebarOpen}
              setShowPaymentModal={setShowPaymentModal}
              onLoaded={() => setFormLoaded(true)}
            />

            {!formLoaded && (
              <button
                className="mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold flex items-center justify-center space-x-2 opacity-50 pointer-events-none"
                disabled
              >
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                <span>Φόρτωση...</span>
              </button>
            )}

            {/* Payment Buttons */}
            <button
              className={`mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold hover:bg-green-600 ${isDisabled ? disabledClasses : ""}`}
              onClick={() => {
                handleClickDoor(
                  router,
                  "POS",
                  user,
                  orderItems,
                  removeItem,
                  setIsSidebarOpen,
                  setShowPaymentModal,
                );
                setPaymentWay("POS");
              }}
              disabled={isDisabled}
            >
              Πληρωμή με POS
            </button>

            <button
              className={`mt-2 w-full bg-green-500 text-white py-3 sm:py-2 text-lg sm:text-lg rounded-xl font-semibold hover:bg-green-600 ${isDisabled ? disabledClasses : ""}`}
              onClick={() => {
                handleClickDoor(
                  router,
                  "door",
                  user,
                  orderItems,
                  removeItem,
                  setIsSidebarOpen,
                  setShowPaymentModal,
                );
                setPaymentWay("door");
              }}
              disabled={isDisabled}
            >
              Πληρωμή με μετρητά
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentWayModal;
