import React from "react";
import Image from "next/image";
import { Edit2, Pencil, Plus } from "lucide-react";
import { Product, Category } from "../../types"; // import your types

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

function isCategoryAvailable(openHour?: string, closeHour?: string): boolean {
  if (!openHour || !closeHour) return true // treat as always available
  const now = new Date()
  const [oh, om] = openHour.split(":").map(Number)
  const [ch, cm] = closeHour.split(":").map(Number)
  const open = oh * 60 + om
  const close = ch * 60 + cm
  const current = now.getHours() * 60 + now.getMinutes()
  return current >= open && current < close
}

function isProductAvailable(product: Product): boolean {
  if (!product.openHour || !product.closeHour) return true // treat as always available
  const now = new Date()
  const [oh, om] = product.openHour.split(":").map(Number)
  const [ch, cm] = product.closeHour.split(":").map(Number)
  const open = oh * 60 + om
  const close = ch * 60 + cm
  const current = now.getHours() * 60 + now.getMinutes()
  return current >= open && current < close
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
  const available = isCategoryAvailable(category.openHour, category.closeHour)

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
          <h2 className="text-2xl font-bold text-black">{category.name}</h2>

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

        {/* Σημείωμα διαθεσιμότητας */}

        {category.alwaysClosed ? (
          <p className="text-red-600 text-base font-medium mt-2">
            Μη διαθέσιμη
          </p>
        ) : (
          <>
            {!available && category.openHour && category.closeHour && (
              <p className="text-red-600 text-base font-medium mt-2">
                Διαθέσιμο από {category.openHour} έως {category.closeHour}
              </p>
            )}
          </>
        )}
      </div>

      {/* Products Grid */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 ${
          (available && !category.alwaysClosed) ? "opacity-100" : "opacity-60"
        }`}>
        {products.map((product) => {
          const productAvailable = isProductAvailable(product);
          const isClickable = business || ((available && !category.alwaysClosed) && (productAvailable && !product.alwaysClosed));

          return (
            <div
              key={product.id}
              className={`relative flex items-start justify-between border border-gray-200 rounded-xl h-28 shadow-sm transition-all
                          ${isClickable ? 'hover:shadow-lg cursor-pointer bg-white' : 'bg-gray-100 cursor-not-allowed'}`}
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
                  { !isClickable ? (
                      "Μη διαθέσιμο"
                    ) : !productAvailable ? (
                      `Διαθέσιμο από ${product.openHour} έως ${product.closeHour}`
                    ) : product.offer ? (
                      <span className="text-green-500">Προσφορά!</span>
                    ) : null
                  }
                </p>

                <p className="font-bold text-yellow-600 text-lg mb-2 flex items-center gap-2">
                  {product.offer ? (
                    <>
                      <span>{product.price.toFixed(2)}€</span>
                      <span className="line-through text-gray-400">
                        {product.offerPrice?.toFixed(2)}€
                      </span>
                    </>
                  ) : (
                    <span>{product.price.toFixed(2)}€</span>
                  )}
                </p>
              </div>

              {/* Product Image */}
              {product.imageId ? (
                <div
                  className={`w-28 relative rounded-r-xl overflow-hidden border border-yellow-400 flex-shrink-0 ${
                    business ? "h-28" : "h-full"
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
