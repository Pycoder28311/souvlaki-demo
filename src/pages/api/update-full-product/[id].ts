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

type Option = {
  id: number;
  question: string;
  price: number;
  comment?: string;
  delete?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method !== "PUT")
    return res.status(405).json({ message: "Method not allowed" });
  if (!id || Array.isArray(id))
    return res.status(400).json({ message: "Invalid product ID" });

  try {
    const productId = parseInt(id, 10);
    const { name, price, ingCategories, options } = req.body as {
      name: string;
      price: number;
      ingCategories: CategoryInput[];
      options: Option[];
    };

    // Update product fields
    await prisma.product.update({
      where: { id: productId },
      data: { name, price: new Prisma.Decimal(price) },
    });

    for (const submittedOpt of options) {
      let optionId: number;

      // Αν υπάρχει ήδη optionId, κάνουμε update/delete αλλιώς create
      if (submittedOpt.id) {
        const existingOpt = await prisma.options.findUnique({
          where: { id: submittedOpt.id },
        });

        if (existingOpt) {
          if (submittedOpt.delete) {
            // Διαγραφή option
            await prisma.options.delete({
              where: { id: existingOpt.id },
            });
            continue;
          } else {
            // Update option
            await prisma.options.update({
              where: { id: submittedOpt.id },
              data: {
                question: submittedOpt.question,
                price: submittedOpt.price,
                comment: submittedOpt.comment || null,
                productId, // να κρατήσει σύνδεση με το προϊόν
              },
            });
            optionId = submittedOpt.id;
          }
        } else {
          // Δεν υπάρχει στη DB, create
          const newOpt = await prisma.options.create({
            data: {
              question: submittedOpt.question,
              price: submittedOpt.price,
              comment: submittedOpt.comment || null,
              productId,
            },
          });
          optionId = newOpt.id;
        }
      } else {
        // Καινούργιο option
        const newOpt = await prisma.options.create({
          data: {
            question: submittedOpt.question,
            price: submittedOpt.price,
            comment: submittedOpt.comment || null,
            productId,
          },
        });
        optionId = newOpt.id;
      }

      // Αν μαρκαρίστηκε για διαγραφή ενώ μόλις δημιουργήθηκε
      if (submittedOpt.delete) {
        await prisma.options.delete({ where: { id: optionId } });
        continue;
      }
    }

    for (const submittedCat of ingCategories) {
      let categoryId: number;

      // Handle category creation/updating
      if (submittedCat.id) {
        const existingCat = await prisma.ingCategory.findUnique({
          where: { id: submittedCat.id },
        });

        if (existingCat) {
          if (submittedCat.delete) {
            // Delete all ingredients first
            await prisma.ingredient.deleteMany({
              where: { ingCategoryId: existingCat.id },
            });
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
