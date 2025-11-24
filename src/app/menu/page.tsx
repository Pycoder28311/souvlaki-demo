import { prisma } from "@/lib/prisma";
import Menu from "./menu";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/authOptions";

export const revalidate = 0;

const DEFAULT_DAY = "default";

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
      intervals: {
        select: {
          id: true,
          open: true,
          close: true,
        },
      },
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          offerPrice: true,
          offer: true,
          description: true,
          intervals: {
            select: {
              id: true,
              open: true,
              close: true,
            },
          },
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
    intervals: {
      [DEFAULT_DAY]: category.intervals.map((i) => ({
        id: i.id,
        open: i.open,
        close: i.close,
        isAfterMidnight: Number(i.close.split(":")[0]) < 4,
      })),
    },
    products: category.products.map((p) => ({
      ...p,
      categoryId: category.id,
      price: Number(p.price),
      offerPrice: Number(p.offerPrice),
      imageId: p.image?.id ?? null,
      image: undefined,
      description: p.description ?? "",
      intervals: {
        [DEFAULT_DAY]: p.intervals?.map((i) => ({
          id: i.id,
          open: i.open,
          close: i.close,
          isAfterMidnight: Number(i.close.split(":")[0]) < 4,
        })) ?? [],
      },
    })),
  }));

  return <Menu categories={categories} business={session?.user?.email == "kopotitore@gmail.com"}/>;
}
