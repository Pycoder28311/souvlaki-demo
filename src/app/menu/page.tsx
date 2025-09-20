import { prisma } from "@/lib/prisma";
import Menu from "./menu";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/authOptions"; // Your NextAuth options

export const revalidate = 0;

export default async function DataPage() {
  // Get session user
  const session = await getServerSession(authOptions);

  // Server-side fetch
  const categoriesFromDb = await prisma.category.findMany({
    orderBy: {
      position: "asc", // ascending order (lowest position first)
    },
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
      price: Number(p.price),
      image: p.image ?? undefined,
    })),
  }));

  return <Menu categories={categories} email={session?.user?.email ?? undefined} />;
}

