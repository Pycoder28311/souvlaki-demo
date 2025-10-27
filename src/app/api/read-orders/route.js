import { prisma } from "@/lib/prisma";

export async function GET(req) {
  const url = new URL(req.url);
  const userIdParam = url.searchParams.get("userId");

  if (!userIdParam) {
    return new Response(JSON.stringify({ success: false, error: "Missing userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = parseInt(userIdParam, 10);
  if (isNaN(userId)) {
    return new Response(JSON.stringify({ success: false, error: "Invalid userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let lastData = "";

      const sendOrders = async () => {
        try {
          const orders = await prisma.productOrder.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      category: true,
                      ingCategories: {
                        include: {
                          ingredients: true,
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

          // Build product map
          const productMap = {};
          orders.forEach((order) => {
            order.items.forEach((item) => {
              if (!productMap[item.productId]) {
                const { id, name, price, imageId, ingCategories, category,openHour, closeHour, alwaysClosed } = item.product;
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
                  availability: {
                    // Κατηγορία
                    category: {
                      openHour: category?.openHour ?? "00:00",
                      closeHour: category?.closeHour ?? "23:59",
                      alwaysClosed: category?.alwaysClosed ?? false,
                    },
                    // Προϊόν
                    product: {
                      openHour: openHour ?? "00:00",
                      closeHour: closeHour ?? "23:59",
                      alwaysClosed: alwaysClosed ?? false,
                    },
                  },
                };
              }
            });
          });

          // Format orders
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
                availability: product.availability,
                selectedIngredients: item.ingredients.map((ing) => ({
                  ...ing.ingredient,
                  price: Number(ing.price),
                })),
                selectedIngCategories: product?.ingCategories || [],
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

          const sseData = JSON.stringify({ orders: formattedOrders, products: productMap });

          // Only send if data changed
          if (sseData !== lastData) {
            lastData = sseData;
            controller.enqueue(new TextEncoder().encode(`data: ${sseData}\n\n`));
          }
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        }
      };

      // Send immediately and then every 2s
      await sendOrders();
      const interval = setInterval(sendOrders, 2000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
