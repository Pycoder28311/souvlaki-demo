// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const userIdParam = url.searchParams.get("userId");

    if (!userIdParam) {
      return NextResponse.json(
        { success: false, error: "Missing userId" },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: "Invalid userId" },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              include: {
                ingCategories: {
                  include: {
                    ingredients: true, // includes all ingredients in this category
                  },
                },
              },
            },
            options: true,
            selectedOptions: true,
            ingredients: { include: { ingredient: true } },
          },
        },
      },
    });

    // Build a separate product map so we don’t embed full product inside orderItem
    const productMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productMap[item.productId]) {
          const { id, name, price, imageId, ingCategories } = item.product;

          productMap[item.productId] = {
            id,
            name,
            price: Number(price),
            imageId,
            ingCategories: ingCategories?.map((cat) => ({
              id: cat.id,
              name: cat.name,
              ingredients: cat.ingredients?.map((ing) => ({
                id: ing.id,
                name: ing.name,
                price: Number(ing.price),
              })) || [],
            })) || [],
          };
        }
      });
    });

    // Format orders with orderItems but no full product inside
    const formattedOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        const product = productMap[item.productId];

        return {
          name: product.name,
          productId: item.productId,
          price: Number(item.price),
          quantity: item.quantity,
          imageId: product.imageId ?? null,
          selectedIngredients: item.ingredients.map((ing) => ({
            ...ing.ingredient,
            price: Number(ing.price),
          })),
          selectedIngCategories: product?.ingCategories || [], // <-- use product's categories
          selectedOptions: item.selectedOptions.map((opt) => ({
            id: opt.id,
            question: opt.question,
            price: Number(opt.price),
            comment: opt.comment,
            productId: opt.productId,
          })),
          options: item.options.map((opt) => ({
            id: opt.id,
            question: opt.question,
            price: Number(opt.price),
            comment: opt.comment,
            productId: opt.productId,
          })),
        };
      }),
    }));

    return NextResponse.json({ success: true, orders: formattedOrders, products: productMap });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
