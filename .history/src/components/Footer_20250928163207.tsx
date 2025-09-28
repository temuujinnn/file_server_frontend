import React from "react";
import type {Product} from "../types/index";
import type {ViewMode} from "./ViewToggle";

// --- PROPS INTERFACE ---
interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  viewMode?: ViewMode;
}

// --- SUB-COMPONENTS for cleaner structure ---

/**
 * Renders the Grid View Card
 */
const GridCardView: React.FC<{product: Product}> = ({product}) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md h-full flex flex-col">
    {/* Product Image Section */}
    <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
      {product.imageUrl ? (
        <img
          src={`http://202.180.218.186:9000${product.imageUrl}`}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>

    {/* Product Info Section */}
    <div className="p-4 flex flex-col flex-grow">
      {/* Tags */}
      {product.mainTag && (
        <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full self-start mb-2">
          {product.mainTag}
        </span>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-grow">
        {product.title}
      </h3>

      {/* Price */}
      <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mt-auto">
        {product.price ? `${product.price} ₮` : "Free"}
      </p>
    </div>
  </div>
);

/**
 * Renders the List View Card
 */
const ListCardView: React.FC<{product: Product}> = ({product}) => (
  <div className="flex bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md w-full">
    {/* Product Image Section */}
    <div className="w-40 flex-shrink-0 bg-gray-200 dark:bg-gray-700">
      {product.imageUrl ? (
        <img
          src={`http://202.180.218.186:9000${product.imageUrl}`}
          alt={product.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>

    {/* Product Info Section */}
    <div className="flex flex-col sm:flex-row flex-grow p-4 justify-between">
      <div className="flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
          {product.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
          {product.description}
        </p>

        {/* Tags */}
        {product.mainTag && (
          <div className="flex items-center gap-2 mt-auto pt-2">
            <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              {product.mainTag}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-start sm:items-end justify-center mt-4 sm:mt-0 sm:ml-4">
        <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
          {product.price ? `${product.price} ₮` : "Free"}
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold">
          View Details
        </button>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  viewMode = "grid",
}) => {
  const handleClick = () => {
    onClick(product);
  };

  const cardBaseStyles =
    "cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1";

  return (
    <div onClick={handleClick} className={cardBaseStyles}>
      {viewMode === "list" ? (
        <ListCardView product={product} />
      ) : (
        <GridCardView product={product} />
      )}
    </div>
  );
};

export default ProductCard;
