import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // your prisma client
import { Prisma } from "@prisma/client"; // import Prisma for Decimal

interface IngredientInput {
  id?: number;
  name: string;
  price: number;
  image?: string | null;
}

interface CategoryInput {
  id?: number;
  name: string;
  ingredients: IngredientInput[];
  delete?: boolean; // flag to delete category
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });
  if (!id || Array.isArray(id))
    return res.status(400).json({ message: "Invalid product ID" });

  try {
    const productId = parseInt(id, 10);
    const { name, price, ingCategories } = req.body as {
      name: string;
      price: number;
      offer: number;
      ingCategories: CategoryInput[];
    };

    // Update product fields
    await prisma.product.update({
      where: { id: productId },
      data: { name, price: new Prisma.Decimal(price) },
    });

    console.log(ingCategories)

    for (const submittedCat of ingCategories) {
      let categoryId: number;
      console.log("inside 1")

      // Handle category creation/updating
      if (submittedCat.id) {
        console.log("inside 2")
        const existingCat = await prisma.ingCategory.findUnique({
          where: { id: submittedCat.id },
        });

        if (existingCat) {
            console.log("inside 3",existingCat)
          if (submittedCat.delete) {
            // Delete all ingredients first
            await prisma.ingredient.deleteMany({
              where: { ingCategoryId: existingCat.id },
            });
            console.log("inside 4")
            // Delete category
            await prisma.ingCategory.delete({
              where: { id: existingCat.id },
            });
            continue; // skip to next category
          } else {
            await prisma.ingCategory.update({
              where: { id: submittedCat.id },
              data: { name: submittedCat.name },
            });
            categoryId = submittedCat.id;
          }
        } else {
          // Category not found, create it
          const newCat = await prisma.ingCategory.create({
            data: { name: submittedCat.name, productId },
          });
          categoryId = newCat.id;
        }
      } else {
        // New category
        const newCat = await prisma.ingCategory.create({
          data: { name: submittedCat.name, productId },
        });
        categoryId = newCat.id;
      }

      if (submittedCat.delete) {
        // If it's a newly created category but marked for deletion
        await prisma.ingCategory.delete({ where: { id: categoryId } });
        continue;
      }

      const submittedIngredientIds = submittedCat.ingredients
        .filter((ing) => ing.id)
        .map((ing) => ing.id!) as number[];

      // Delete ingredients that were removed on frontend
      if (submittedIngredientIds.length) {
        await prisma.ingredient.deleteMany({
          where: {
            ingCategoryId: categoryId,
            id: { notIn: submittedIngredientIds },
          },
        });
      } else {
        // delete all if no ingredients submitted
        await prisma.ingredient.deleteMany({ where: { ingCategoryId: categoryId } });
      }

      // Create/update ingredients
      for (const ing of submittedCat.ingredients) {
        if (ing.id) {
          const existingIng = await prisma.ingredient.findUnique({
            where: { id: ing.id },
          });
          if (existingIng) {
            await prisma.ingredient.update({
              where: { id: ing.id },
              data: { name: ing.name, price: ing.price, image: ing.image || null },
            });
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
