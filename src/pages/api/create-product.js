import { prisma } from "@/lib/prisma";
import { ALL_DAY_OPEN, ALL_DAY_CLOSE } from "@/app/utils/hours";

const DEFAULT_DAY = "default"; // same as your frontend

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, price, categoryId, offer, description } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Product name is required" });
    }

    if (!description || typeof description !== "string") {
      return res.status(400).json({ message: "Product description is required" });
    }

    if (!price || typeof price !== "number") {
      return res.status(400).json({ message: "Product price must be a number" });
    }

    if (!categoryId || typeof categoryId !== "number") {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // Create product in database
    const newProduct = await prisma.product.create({
      data: {
        name,
        price,
        offer: offer ?? false,
        description,
        category: {
          connect: { id: categoryId },
        },
        intervals: {
          create: {
            open: ALL_DAY_OPEN,
            close: ALL_DAY_CLOSE,
          },
        },
      },
      include: {
        intervals: true,
      },
    });

    // Format product intervals for frontend
    const formattedProduct = {
      ...newProduct,
      intervals: {
        [DEFAULT_DAY]: newProduct.intervals.map((i) => ({
          id: i.id,
          open: i.open,
          close: i.close,
          isAfterMidnight: Number(i.close.split(":")[0]) < 4,
        })),
      },
    };

    return res.status(201).json(formattedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
