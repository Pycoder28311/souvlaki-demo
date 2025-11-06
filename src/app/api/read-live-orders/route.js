// app/api/orders/stream/route.ts (or wherever your API routes are)
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session || session?.user?.email !== "kopotitore@gmail.com") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      let lastOrders = [];

      const sendOrders = async () => {
        const orders = await prisma.productOrder.findMany({
          where: {
            status: { in: ["pending", "requested"] }, // ✅ get pending OR accepted orders
          },
          orderBy: [
            { id: "desc" }, // newest first if same timestamp
          ],
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

        // Only send if orders changed
        if (JSON.stringify(orders) !== JSON.stringify(lastOrders)) {
          lastOrders = orders;
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify(orders)}\n\n`)
          );
        }
      };

      // Poll every 2 seconds (or less)
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
