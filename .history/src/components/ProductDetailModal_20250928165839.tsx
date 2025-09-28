import React from "react";
import type {Product} from "../types";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !product) {
    return null;
  }

  const handleDownload = () => {
    if (product._id) {
      const downloadUrl = `http://202.180.218.186:9000/user/game/download?id=${product._id}`;
      window.open(downloadUrl, "_blank");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{zIndex: 9999}}
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white dark:bg-gray-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
        style={{borderRadius: "8px"}}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {product.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              {product.imageUrl ? (
                <img
                  src={`http://202.180.218.186:9000${product.imageUrl}`}
                  alt={product.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-6xl">
                    🎮
                  </span>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.mainTag && (
                  <span className="bg-electric-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {product.mainTag}
                  </span>
                )}
                {product.additionalTags &&
                  product.additionalTags.map(
                    (
                      tag: {
                        name:
                          | string
                          | number
                          | boolean
                          | React.ReactElement<
                              any,
                              string | React.JSXElementConstructor<any>
                            >
                          | Iterable<React.ReactNode>
                          | React.ReactPortal
                          | null
                          | undefined;
                      },
                      index: React.Key | null | undefined
                    ) => (
                      <span
                        key={index}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {tag.name}
                      </span>
                    )
                  )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              {/* Title and Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                {product.path && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Зам:
                    </span>
                    <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                      {product.path}
                    </p>
                  </div>
                )}

                {product.createdAt && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Үүсгэсэн:
                    </span>
                    <p className="text-gray-900 dark:text-white">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="pt-4">
                <button
                  onClick={handleDownload}
                  className="w-full bg-electric-blue-500 hover:bg-electric-blue-600 text-white font-medium py-3 px-6 transition-colors duration-200 flex items-center justify-center space-x-2"
                  style={{borderRadius: "8px"}}
                >
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{product.mainTag || "Файл"} татаж авах</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
