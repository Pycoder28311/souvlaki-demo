// src/app/data/page.tsx
import { prisma } from "@/lib/prisma";
import { Dispatch, SetStateAction } from "react";

export const revalidate = 0;

export default async function DataPage({ isScrolled, activeCategory, setActiveCategory }: { isScrolled: boolean; activeCategory: number; setActiveCategory: Dispatch<SetStateAction<number>> }) {
  // Server-side fetch
  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  
  return (
    <section
        className={`sticky z-30 py-4 border-b transition-all duration-300 ${
            isScrolled ? "bg-gray-50 shadow-md" : "bg-white"
        } top-[45px] md:top-[55px]`}
        >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 overflow-x-auto md:overflow-x-visible whitespace-nowrap md:justify-center">
            {categories.map((cat) => (
                <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-block px-6 py-3 font-bold transition-all flex-shrink-0 ${
                    activeCategory === cat.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                >
                {cat.name} {cat.id === activeCategory && "(active)"}
                </button>
            ))}
            </div>
        </div>
    </section>
  );
}

