import { prisma } from "@/lib/prisma";
import Menu from "./menu";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/authOptions";

export const revalidate = 0;

export default async function DataPage() {
  // Get session user
  const session = await getServerSession(authOptions);

  // Fetch categories with products and their images
  const categoriesFromDb = await prisma.category.findMany({
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
      name: true,
      openHour: true,
      closeHour: true,
      alwaysClosed: true,
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          offerPrice: true,
          offer: true,
          description: true,
          openHour: true,
          closeHour: true,
          alwaysClosed: true,
          image: {
            select: {
              id: true, // only fetch the image ID
            },
          },
        },
      },
    },
  });

  // Convert Decimal to number and add imageId
  const categories = categoriesFromDb.map((category) => ({
    ...category,
    openHour: category.openHour ?? undefined,
    closeHour: category.closeHour ?? undefined,
    products: category.products.map((p) => ({
      ...p,
      categoryId: category.id,
      price: Number(p.price),
      offerPrice: Number(p.offerPrice),
      imageId: p.image?.id ?? null,
      image: undefined,
      description: p.description ?? "",
      openHour: p.openHour ?? undefined,
      closeHour: p.closeHour ?? undefined,
    })),
  }));

  return <Menu categories={categories} business={session?.user?.email == "kopotitore@gmail.com"}/>;
}
