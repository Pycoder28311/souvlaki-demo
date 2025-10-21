import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session?.user?.email !== "kopotitore@gmail.com") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
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

    return new Response(JSON.stringify(orders), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch orders" }), { status: 500 });
  }
}
