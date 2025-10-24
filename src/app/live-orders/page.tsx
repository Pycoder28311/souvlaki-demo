"use client";

import { useEffect, useState } from "react";
import OrderCard from "./orderCard";

type Ingredient = {
  id: number;
  name: string;
  price: number;
  ingredient: {
    id: number;
    name: string;
    price: number;
  };
};

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  productId?: number;
};

type OrderItem = {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageId: number | null;
  ingredients: Ingredient[]; // optional array of selected ingredients
  selectedIngCategories?: IngCategory[]; // optional array of selected ingredient categories
  selectedOptions: Option[];
  options?: Option[];
  product: Product;
};

type Order = {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  user: User;
  paid: boolean;
  deliveryTime: string;
};

type IngCategory = {
  id: number;
  name: string;
  ingredients: Ingredient[];
  isRequired?: boolean;
};

type ImageType = {
  id: number;
  data: Uint8Array;
  createdAt: Date;
}

type Product = {
  id: number
  name: string
  price: number
  offer: boolean
  offerPrice?: number;
  description: string;
  image?: ImageType | null
  imageId?: number | null; 
  ingCategories?: IngCategory[];
  options?: Option[];
}

type User = {
  id: number;
  name: string;
  email: string;
  image?: string;
  business: boolean;
  address: string;
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const evtSource = new EventSource("/api/read-live-orders");

    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setOrders(data);
    };

    return () => {
      evtSource.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8 max-w-3xl mx-auto pt-24">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Live Παραγγελίες</h1>

        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
