import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/authOptions";
import { redirect } from "next/navigation";
import OrdersSocket from "./OrdersSocket";

export const revalidate = 0;

export default async function MyOrdersPage() {

  const session = await getServerSession(authOptions);
  if (!session || session?.user?.email !== "kopotitore@gmail.com") {
    // Redirect σε error page
    redirect("/error"); // ή οποιοδήποτε route για σφάλμα
  }

  const orders = await prisma.productOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: {
        include: {
          product: true,
          ingredients: { include: { ingredient: true } },
          selectedOptions: true,
        },
      },
    },
  });

  if (!orders || orders.length === 0) {
    return <p className="p-8">Δεν υπάρχουν παραγγελίες ακόμα</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-3xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Λίστα Παραγγελιών</h1>

        <OrdersSocket initialOrders={orders} />

        {orders.map((order) => (
          <div
            key={order.id}
            className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center">
              <p className="font-semibold text-gray-900">Παραγγελία #{order.id}</p>
              <span
                className={`px-3 py-1 font-medium rounded-full ${
                  order.status === "completed"
                    ? "bg-green-500 text-white"
                    : order.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {order.status === "completed"
                  ? "Ολοκληρώθηκε"
                  : order.status === "pending"
                  ? "Σε εκκρεμότητα"
                  : "Ακυρώθηκε"}
              </span>
              <div
                className={`px-3 py-1 rounded-full text-white ${
                  order?.paid ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {order?.paid ? "Πληρωμή Online" : "Πληρωμή Κατά την Παραλαβή"}
              </div>
            </div>

            {/* Order Details */}
            <div className="p-4 space-y-3">
              <p className="text-gray-700">
                <strong>Όνομα:</strong> {order.user.name}
              </p>

              <p className="text-gray-700">
                <strong>Διεύθυνση:</strong> {order.user.address}
              </p>

              <p className="text-gray-700">
                <strong>Δημιουργήθηκε:</strong> {order.createdAt.toLocaleString()}
              </p>

              {/* Items */}
              <ul className="space-y-3">
                {order.items.map((item) => {
                  // Calculate extras
                  const optionsTotal = item.selectedOptions.reduce(
                    (acc, opt) => acc + Number(opt.price || 0),
                    0
                  );
                  const ingredientsTotal = item.ingredients.reduce(
                    (acc, ing) => acc + Number(ing.price || 0),
                    0
                  );

                  // Total per item
                  const itemTotal = (Number(item.price) - (optionsTotal + ingredientsTotal)) * item.quantity;

                  return (
                    <li
                      key={item.id}
                      className="bg-gray-50 border rounded-lg p-3 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-800">
                          {item.quantity} × {item.product.name}
                        </span>
                        <span className="text-gray-700">{itemTotal.toFixed(2)}€</span>
                      </div>

                      {item.ingredients.length > 0 && (
                        <ul className="ml-5 mt-2 text-sm text-gray-600 list-disc">
                          {item.ingredients.map((ing) => (
                            <li key={ing.id}>
                              {ing.ingredient.name}{" "}
                              {ing.price ? `(${Number(ing.price).toFixed(2)}€)` : ""}
                            </li>
                          ))}
                        </ul>
                      )}

                      {item.selectedOptions.length > 0 && (
                        <ul className="ml-5 mt-2 text-sm text-gray-600 list-disc">
                          {item.selectedOptions.map((opt) => (
                            <li key={opt.id}>
                              {opt.comment}{" "}
                              {opt.price ? `(${Number(opt.price).toFixed(2)}€)` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                      <span className="mt-2">Σύνολο:</span> {Number(item.price)}€
                    </li>
                  );
                })}
              </ul>

              <p className="text-gray-700 text-xl">
                <strong>Σύνολο:</strong> {order.total.toFixed(2)}€
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
