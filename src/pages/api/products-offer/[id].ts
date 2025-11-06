import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PATCH") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const { offer, offerPrice, price } = req.body as { offer: boolean; offerPrice?: number, price: number };

    if (typeof offer !== "boolean") {
      return res.status(400).json({ message: "Invalid offer value" });
    }

    // Αν ενεργοποιείται η προσφορά, η τιμή γίνεται η offerPrice
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: { 
        offer, 
        price: offer ? offerPrice ?? 0 : undefined, // μόνο αν είναι ενεργό
        offerPrice: price ?? 0,              // πάντα αποθηκεύεται
      },
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to update product offer" });
  }
}
