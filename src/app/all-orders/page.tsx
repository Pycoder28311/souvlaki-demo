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
    <div>
      <Navbar />
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Orders List</h1>
        {orders.map((order) => (
          <div key={order.id} className="mb-6 border p-4 rounded-md shadow-sm">
            <p><strong>Order #{order.id}</strong></p>
            <p>Status: {order.status}</p>
            <p>Total: €{order.total.toFixed(2)}</p>
            <p>Created: {order.createdAt.toLocaleString()}</p>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity} x {item.product.name} (€{item.price.toFixed(2)})
                  {item.ingredients.length > 0 && (
                    <ul className="ml-4 text-sm text-gray-600">
                      {item.ingredients.map((ing) => (
                        <li key={ing.id}>+ {ing.ingredient.name} (€{ing.price.toFixed(2)})</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
