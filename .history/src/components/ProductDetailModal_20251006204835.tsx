import React, {useState} from "react";
import {Link} from "react-router-dom";
import {downloadProduct} from "../services/api";
import {useAuth} from "../contexts/AuthContext";
import type {Product} from "../types/index";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const {user, isAuthenticated} = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  if (!isOpen || !product) {
    return null;
  }

  const handleDownload = () => {
    console.log("Download button clicked in modal");
    console.log("Authentication status:", isAuthenticated);
    console.log("User data:", user);

    // Check authentication first
    if (!isAuthenticated) {
      console.log("User not authenticated - showing toast");
      setShowToast(true);
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // Check subscription status
    if (!user?.isSubscribed) {
      console.log("User not premium - showing subscription modal");
      setShowSubscriptionModal(true);
      return;
    }

    // User is authenticated and has premium subscription
    console.log("User has premium subscription - showing download confirmation");
    setShowDownloadModal(true);
  };

  const handleConfirmDownload = () => {
    const productId = (product as any).id || product._id;
    if (productId) {
      console.log("Starting download for product:", productId);
      downloadProduct(productId);
    }
    setShowDownloadModal(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Combine main image with game images
  const allImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(product.gameImages || []),
  ];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4"
      style={{zIndex: 9999}}
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white pr-4">
            {product.title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200 flex-shrink-0"
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
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              {allImages.length > 0 ? (
                <>
                  {/* Main Image */}
                  <div className="relative w-full h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden group">
                    <img
                      src={`http://202.180.218.186:9000${allImages[selectedImageIndex]}`}
                      alt={`${product.title} - Image ${selectedImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {/* Navigation Arrows */}
                    {allImages.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                          aria-label="Previous image"
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
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                          aria-label="Next image"
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
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {selectedImageIndex + 1} / {allImages.length}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Grid */}
                  {allImages.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {allImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                            selectedImageIndex === index
                              ? "border-blue-500 dark:border-blue-400 scale-95"
                              : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                          }`}
                        >
                          <img
                            src={`http://202.180.218.186:9000${image}`}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-64 sm:h-80 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-4xl sm:text-6xl">
                    🎮
                  </span>
                </div>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.mainTag && (
                  <span className="bg-electric-blue-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    {product.mainTag}
                  </span>
                )}
                {product.additionalTags &&
                  product.additionalTags.map(
                    (
                      tag: {name?: string | number | boolean | React.ReactNode},
                      index: number
                    ) => (
                      <span
                        key={index}
                        className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs sm:text-sm"
                      >
                        {tag.name}
                      </span>
                    )
                  )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Title and Description */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  {product.title}
                </h3>
                {product.description && (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                {product.path && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Зам:
                    </span>
                    <p className="text-gray-900 dark:text-white font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded break-all">
                      {product.path}
                    </p>
                  </div>
                )}

                {product.youtubeLink && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm block mb-2">
                      Видео холбоос:
                    </span>
                    <a
                      href={product.youtubeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm sm:text-base text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      YouTube-ээр үзэх
                    </a>
                  </div>
                )}

                {product.createdAt && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Үүсгэсэн:
                    </span>
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Download Button */}
              <div className="pt-4">
                <button
                  onClick={handleDownload}
                  className="w-full bg-electric-blue-500 hover:bg-electric-blue-600 text-white font-medium py-3 px-4 sm:px-6 transition-colors duration-200 flex items-center justify-center space-x-2 rounded-lg text-sm sm:text-base"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
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
