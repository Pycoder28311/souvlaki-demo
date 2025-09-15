import { prisma } from "@/lib/prisma";
import Menu from "./menu";

export const revalidate = 0;

export default async function DataPage() {
  // Server-side fetch
   const categoriesFromDb = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          offer: true,
          image: true,
        },
      },
    },
  });

  // Convert Decimal to number for TypeScript
  const categories = categoriesFromDb.map((category) => ({
    ...category,
    products: category.products.map((p) => ({
      ...p,
      price: Number(p.price), // <-- convert Decimal to number
      image: p.image ?? undefined, // optional
    })),
  }));

  return <Menu categories={categories} />;
}
