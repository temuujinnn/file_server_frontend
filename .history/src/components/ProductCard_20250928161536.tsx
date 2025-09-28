import React from "react";
import type {Product} from "../types/index";
import type {ViewMode} from "./ViewToggle";

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  viewMode?: ViewMode;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  viewMode = "grid",
}) => {
  const handleClick = () => {
    onClick(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(product);
    }
  };

  if (viewMode === "list") {
    return (
      <div
        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/20 cursor-pointer transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${product.title}`}
      >
        <div className="flex overflow-hidden rounded-xl">
          {/* Product Image - List View */}
          <div className="relative w-36 h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
            {product.imageUrl ? (
              <>
                <img
                  src={`http://202.180.218.186:9000${product.imageUrl}`}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-2xl">
                    🎮
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Product Info - List View */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between h-full">
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {product.title}
                  </h3>

                  {product.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {product.mainTag && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {product.mainTag}
                    </span>
                  )}

                  <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                    Free
                  </span>
                </div>
              </div>

              {/* Arrow indicator */}
              <div className="ml-4 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (default)
  return (
    <div
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg dark:shadow-gray-900/20 cursor-pointer transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-1"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.title}`}
    >
      {/* Product Image */}
      <div className="relative aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        {product.imageUrl ? (
          <>
            <img
              src={`http://202.180.218.186:9000${product.imageUrl}`}
              alt={product.title}
              className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-48 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-gray-500 dark:text-gray-400 text-3xl">
                🎮
              </span>
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        {/* Tag overlay */}
        {product.mainTag && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 text-gray-800 backdrop-blur-sm border border-white/20 shadow-sm">
              {product.mainTag}
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-tight">
            {product.title}
          </h3>

          {product.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-green-600 dark:text-green-400 font-semibold">
            Татаж авах
          </span>

          {/* Action indicator */}
          <div className="text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 transform group-hover:translate-x-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};

export default ProductCard;
