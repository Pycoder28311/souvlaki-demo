// pages/api/offers.ts
import { prisma } from "@/lib/prisma";

const DEFAULT_DAY = "default";

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
            },
          },
          intervals: true
        },
      });

      const formattedProducts = products.map((p) => ({
        ...p,
        intervals: {
          [DEFAULT_DAY]: p.intervals?.map((i) => ({
            id: i.id,
            open: i.open,
            close: i.close,
            isAfterMidnight: Number(i.close.split(":")[0]) < 4,
          })) ?? [],
        },
      }));

      res.status(200).json(formattedProducts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
