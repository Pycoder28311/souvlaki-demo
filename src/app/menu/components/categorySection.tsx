import React from "react";
import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { Product, Category } from "../../types"; // import your types
import { checkObjectIntervals } from "../../utils/checkObjectIntervals";

interface CategorySectionProps {
  category: Category;
  products: Product[];
  business?: boolean;
  categoryRefs: React.MutableRefObject<{ [key: number]: HTMLElement | null }>;
  selectedCategory?: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  setSelectedProduct: (product: Product) => void;
  selectedAdminProduct?: Product | null;
  setSelectedAdminProduct: (product: Product | null) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  products,
  business,
  categoryRefs,
  selectedCategory,
  setSelectedCategory,
  setSelectedProduct,
  selectedAdminProduct,
  setSelectedAdminProduct,
}) => {
  const isCategoryOpen = checkObjectIntervals(category.intervals);

  if (!business && !isCategoryOpen) return null;

  return (
    <section
      key={category.id}
      ref={(el) => {
        categoryRefs.current[category.id] = el;
      }}
    >
      {/* Category Header */}
      <div className="flex flex-col mb-4">
        {/* Header: όνομα + κουμπί */}
        <div className="flex justify-between items-center">
          <h2 className=" text-black flex items-center gap-4">
            <span className="text-2xl font-bold">
              {category.name}
            </span>
            {!isCategoryOpen && (
              <span className="text-red-500 font-semibold text-md">
                Μη διαθέσιμο
              </span>
            )}
          </h2>

          {business && (
            <button
              onClick={() =>
                setSelectedCategory(
                  selectedCategory?.id === category.id ? null : category
                )
              }
              className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              title="Επεξεργασία Κατηγορίας"
            >
              <Pencil size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6`}>
        {products.map((product) => {
          const availability = checkObjectIntervals(product.intervals)
          const isAvailable = (availability)
          const isClickable = isAvailable || business;

          return (
            <div
              key={product.id}
              className={`relative flex items-start justify-between border border-gray-200 rounded-xl h-28 shadow-sm transition-all
                          ${(isClickable) ? 'hover:shadow-lg cursor-pointer bg-white' : 'bg-gray-100 cursor-not-allowed'}`}
              onClick={() => {
                if (isClickable) setSelectedProduct(product);
              }}
            >
              {/* Product Info */}
              <div className="flex-1 p-2 pr-12 pl-3">
                <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                  {product.name}
                </h3>

                {/* Product Availability Note */}
                <p className="text-sm text-red-500 font-semibold mb-1">
                  {!isAvailable ? (
                    <>
                      {(Object.values(product.intervals).flat().some(i => i.open === "04:00" && i.close === "03:59") || product.intervals["default"].length === 0) ? (
                        <span className="text-red-500 font-semibold">Μη διαθέσιμο</span>
                      ) : (
                        <>
                          Διαθέσιμο:<span>{" "}</span>
                          {Object.values(product.intervals)
                            .flat()
                            .map(interval => `${interval.open} - ${interval.close}`)
                            .join(", ")}
                        </>
                      )}
                    </>
                  ) : product.offer ? (
                    <span className="text-green-500">Προσφορά!</span>
                  ) : null}
                </p>

                <p className="font-bold text-yellow-600 text-lg mb-2 flex items-center gap-2">
                  {product.offer ? (
                    <>
                      <span>{Number(product.price).toFixed(2)}€</span>
                      <span className="line-through text-gray-400">
                        {Number(product.offerPrice)?.toFixed(2)}€
                      </span>
                    </>
                  ) : (
                    <span>{Number(product.price).toFixed(2)}€</span>
                  )}
                </p>
              </div>

              {/* Product Image */}
              {product.imageId ? (
                <div
                  className={`w-28 relative rounded-r-xl overflow-hidden border border-yellow-400 flex-shrink-0 ${business ? "h-28" : "h-full"
                    }`}
                >
                  <Image
                    src={`/api/images/${product.imageId}`}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />

                  {/* + Button */}
                  <button
                    className="absolute bottom-2 right-2 p-2 bg-yellow-400 text-gray-800 font-bold rounded-lg transition transform hover:bg-yellow-500 shadow-[2px_2px_0px_0px_rgba(202,138,4,0.5)]"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ) : (
                <button
                  className="absolute bottom-2 right-2 p-2 bg-yellow-400 text-gray-800 font-bold rounded-lg transition transform hover:bg-yellow-500 shadow-[2px_2px_0px_0px_rgba(202,138,4,0.5)]"
                >
                  <Plus size={20} />
                </button>
              )}

              {business && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAdminProduct(
                      selectedAdminProduct?.id === product.id ? null : product
                    );
                  }}
                  className="absolute top-2 right-2 p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  title="Επεξεργασία Προϊόντος"
                >
                  <Pencil size={20} />
                </button>
              )}
            </div>)
        })}
      </div>
    </section>
  );
};

export default CategorySection;
