import { prisma } from "@/lib/prisma"; // or your DB client

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const products = await prisma.product.findMany({
        where: { offer: true }, // only products with offer = true
      });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
