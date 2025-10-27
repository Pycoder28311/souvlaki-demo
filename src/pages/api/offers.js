// pages/api/offers.ts
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        where: { offer: true }, // μόνο προϊόντα με offer = true
        include: {
          category: {
            select: {
              id: true,
              name: true,
              openHour: true,
              closeHour: true,
              alwaysClosed: true,
            },
          },
        },
      });

      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
