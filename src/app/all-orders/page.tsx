import { prisma } from "@/lib/prisma";
import Navbar from '../navigator';

export const revalidate = 0;

export default async function MyOrdersPage() {

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
          ingredients: { include: { ingredient: true } },
        },
      },
    },
  });

  if (!orders || orders.length === 0) {
    return <p className="p-8">No orders exist yet</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar scrolled={true}/>
      <div className="p-8 max-w-3xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Orders List</h1>

        {orders.map((order) => (
          <div
            key={order.id}
            className="mb-6 rounded-lg shadow-md border border-gray-200 bg-white overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-yellow-400 px-4 py-2 flex justify-between items-center">
              <p className="font-semibold text-gray-900">Order #{order.id}</p>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  order.status === "completed"
                    ? "bg-green-500 text-white"
                    : order.status === "pending"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {order.status}
              </span>
            </div>

            {/* Order Details */}
            <div className="p-4 space-y-3">
              <p className="text-gray-700">
                <strong>Total:</strong> €{order.total.toFixed(2)}
              </p>
              <p className="text-gray-500 text-sm">
                <strong>Created:</strong> {order.createdAt.toLocaleString()}
              </p>

              {/* Items */}
              <div className="bg-gray-100 p-3 rounded-lg">
                <h2 className="text-gray-800 font-medium mb-2">Items</h2>
                <ul className="space-y-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="text-gray-700">
                      <span className="font-medium">
                        {item.quantity} × {item.product.name}
                      </span>{" "}
                      (€{item.price.toFixed(2)})
                      {item.ingredients.length > 0 && (
                        <ul className="ml-5 mt-1 text-sm text-gray-600 list-disc">
                          {item.ingredients.map((ing) => (
                            <li key={ing.id}>
                              + {ing.ingredient.name} (€{ing.price.toFixed(2)})
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
