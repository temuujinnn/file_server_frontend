import React from "react";
import ProductCard from "./ProductCard";
import type {Product} from "../types/index";
import type {ViewMode} from "./ViewToggle";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductClick: (product: Product) => void;
  viewMode?: ViewMode;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading,
  onProductClick,
  viewMode = "grid",
}) => {
  if (loading) {
    const containerClass =
      viewMode === "list"
        ? "space-y-4"
        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

    return (
      <div className={containerClass}>
        {[...Array(8)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            {viewMode === "list" ? (
              <div className="flex flex-col sm:flex-row">
                <div className="w-full sm:w-32 h-32 sm:h-24 bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="w-full h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Бүтээгдэхүүн олдсонгүй
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Шүүлтүүрээ тохируулж үзээрэй эсвэл дараа дахин шалгана уу.
        </p>
      </div>
    );
  }

  const containerClass =
    viewMode === "list"
      ? "space-y-4"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

  return (
    <div className={containerClass}>
      {Array.isArray(products) &&
        products.map((product) => (
          <ProductCard
            key={product.id || product._id}
            product={product}
            onClick={onProductClick}
            viewMode={viewMode}
          />
        ))}
    </div>
  );
};

export default ProductGrid;
