import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";       // your prisma client
import { Prisma } from "@prisma/client";     // import Prisma for Decimal

interface IngredientInput {
  id?: number;        // optional, because new ingredients may not have an ID yet
  name: string;
  price: number;
  image?: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT") return res.status(405).json({ message: "Method not allowed" });
  if (!id || Array.isArray(id)) return res.status(400).json({ message: "Invalid product ID" });

  try {
    const productId = parseInt(id, 10);
    const { name, price, offer, ingCategories } = req.body;

    // Update product fields
    await prisma.product.update({
      where: { id: productId },
      data: { name, price: new Prisma.Decimal(price), offer },
    });

    for (const submittedCat of ingCategories) {
    let categoryId: number;

    // Handle category creation/updating
    if (submittedCat.id) {
        const existingCat = await prisma.ingCategory.findUnique({ where: { id: submittedCat.id } });
        if (existingCat) {
        await prisma.ingCategory.update({
            where: { id: submittedCat.id },
            data: { name: submittedCat.name },
        });
        categoryId = submittedCat.id;
        } else {
        const newCat = await prisma.ingCategory.create({
            data: { name: submittedCat.name, productId },
        });
        categoryId = newCat.id;
        }
    } else {
        const newCat = await prisma.ingCategory.create({
        data: { name: submittedCat.name, productId },
        });
        categoryId = newCat.id;
    }
    
    const submittedIngredientIds = submittedCat.ingredients
        .filter((ing: IngredientInput) => ing.id) // now typed
        .map((ing: IngredientInput) => ing.id!);

    // Delete ingredients that were removed on frontend
    await prisma.ingredient.deleteMany({
        where: {
        ingCategoryId: categoryId,
        id: { notIn: submittedIngredientIds.length ? submittedIngredientIds : [0] },
        },
    });

    // Now create/update ingredients
    for (const ing of submittedCat.ingredients) {
        if (ing.id) {
        const existingIng = await prisma.ingredient.findUnique({ where: { id: ing.id } });
        if (existingIng) {
            await prisma.ingredient.update({
            where: { id: ing.id },
            data: { name: ing.name, price: ing.price, image: ing.image || null },
            });
        } else {
            // Create new ingredient (id removed)
            await prisma.ingredient.create({
            data: {
                name: ing.name,
                price: ing.price,
                image: ing.image || null,
                ingCategoryId: categoryId,
            },
            });
        }
        } else {
        await prisma.ingredient.create({
            data: {
            name: ing.name,
            price: ing.price,
            image: ing.image || null,
            ingCategoryId: categoryId,
            },
        });
        }
    }
    }

    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update product" });
  }
}
