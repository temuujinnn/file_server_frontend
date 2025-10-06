import React, {useState, useEffect, useRef, useCallback} from "react";
import TagSidebar from "../components/TagSidebar";
import ProductGrid from "../components/ProductGrid";
import ProductDetailModal from "../components/ProductDetailModal";
import ViewToggle from "../components/ViewToggle";
import {fetchAllProducts, fetchProductsByTag} from "../services/api";
import type {Product, Tag} from "../types/index";
import type {ViewMode} from "../components/ViewToggle";

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [selectedMainTag, setSelectedMainTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadAllProducts = useCallback(
    async (page: number = 1, reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const {products: productsData, currentPage: responsePage} =
          await fetchAllProducts(page, 20);

        if (reset) {
          setAllProducts(productsData);
          setProducts(productsData);
          setCurrentPage(responsePage);
        } else {
          setAllProducts((prev) => [...prev, ...productsData]);
          setProducts((prev) => [...prev, ...productsData]);
          setCurrentPage(responsePage);
        }

        // If we got less than 20 items, we've reached the end
        setHasMore(productsData.length === 20);
      } catch (err) {
        setError("Бүтээгдэхүүн ачаалахад алдаа гарлаа");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const loadProductsByTag = useCallback(
    async (tagId: string, page: number = 1, reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }
        setError(null);

        const {products: productsData, currentPage: responsePage} =
          await fetchProductsByTag(tagId, page, 20);

        if (reset) {
          setProducts(productsData);
          setCurrentPage(responsePage);
        } else {
          setProducts((prev) => [...prev, ...productsData]);
          setCurrentPage(responsePage);
        }

        // If we got less than 20 items, we've reached the end
        setHasMore(productsData.length === 20);
      } catch (err) {
        setError("Шүүсэн бүтээгдэхүүн ачаалахад алдаа гарлаа");
        console.error("Error loading filtered products:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Load all products on initial page load
  useEffect(() => {
    loadAllProducts(1, true);
  }, [loadAllProducts]);

  const handleTagSelect = async (tag: Tag | null) => {
    setSelectedTag(tag);
    setSearchQuery(""); // Clear search when selecting tag
    setCurrentPage(1);
    setHasMore(true);

    try {
      setLoading(true);
      setError(null);

      if (tag === null) {
        // Load all products
        await loadAllProducts(1, true);
      } else {
        // Load products filtered by tag with pagination
        const tagId = tag._id ?? tag._id;
        if (!tagId) {
          throw new Error("Тегийн ID байхгүй байна");
        }
        await loadProductsByTag(tagId, 1, true);
      }
    } catch (err) {
      setError("Шүүсэн бүтээгдэхүүн ачаалахад алдаа гарлаа");
      console.error("Error loading filtered products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMainTagSelect = async (mainTag: string | null) => {
    setSelectedMainTag(mainTag);
    setSelectedTag(null); // Clear tag selection when selecting mainTag
    setSearchQuery(""); // Clear search when selecting main tag
    setCurrentPage(1);

    try {
      setLoading(true);
      setError(null);

      if (mainTag === null) {
        // Load all products
        setHasMore(true);
        await loadAllProducts(1, true);
      } else {
        // Filter products by mainTag on the client side
        const filteredProducts = allProducts.filter(
          (product) => product.mainTag === mainTag
        );
        setProducts(filteredProducts);
        setHasMore(false); // Disable infinite scroll for filtered results
      }
    } catch (err) {
      setError("Шүүсэн бүтээгдэхүүн ачаалахад алдаа гарлаа");
      console.error("Error loading filtered products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleProductSearch = (query: string) => {
    setSearchQuery(query);
    setHasMore(false); // Disable infinite scroll during search

    if (!query.trim()) {
      // If search is empty, show all products or apply current filters
      if (selectedMainTag) {
        const filteredProducts = allProducts.filter(
          (product) => product.mainTag === selectedMainTag
        );
        setProducts(filteredProducts);
      } else if (selectedTag) {
        // Keep current tag filter
        setProducts(products);
      } else {
        setProducts(allProducts);
        setHasMore(true); // Re-enable infinite scroll
      }
      return;
    }

    // Filter products by search query
    let filteredProducts = allProducts.filter((product) =>
      product.title?.toLowerCase().includes(query.toLowerCase())
    );

    // Apply additional filters if they exist
    if (selectedMainTag) {
      filteredProducts = filteredProducts.filter(
        (product) => product.mainTag === selectedMainTag
      );
    }

    setProducts(filteredProducts);
  };

  // Infinite scroll observer
  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !searchQuery) {
          console.log("Loading more products...");

          // If a tag is selected, load more products for that tag
          if (selectedTag && selectedTag._id) {
            loadProductsByTag(selectedTag._id, currentPage + 1, false);
          }
          // If no tag or mainTag is selected, load all products
          else if (!selectedMainTag) {
            loadAllProducts(currentPage + 1, false);
          }
          // Note: mainTag filtering is client-side, so no infinite scroll
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [
      loading,
      loadingMore,
      hasMore,
      currentPage,
      selectedTag,
      selectedMainTag,
      searchQuery,
      loadProductsByTag,
      loadAllProducts,
    ]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Бүх тоглоом болон програм-г нэг дороос татаж аваарай
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Та нэг удаа төлөөд бүх тоглоом болон програмыг татаж авах боломжтой.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4 order-2 lg:order-1">
            <TagSidebar
              onTagSelect={handleTagSelect}
              selectedTag={selectedTag}
              onMainTagSelect={handleMainTagSelect}
              selectedMainTag={selectedMainTag}
              products={products}
              onProductSearch={handleProductSearch}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4 order-1 lg:order-2">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg">
                <p className="text-red-600 dark:text-red-400 text-sm sm:text-base">
                  {error}
                </p>
                <button
                  onClick={() => loadAllProducts(1, true)}
                  className="mt-2 text-xs sm:text-sm text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline"
                >
                  Дахин оролдох
                </button>
              </div>
            )}

            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  {searchQuery
                    ? `"${searchQuery}" хайлтын үр дүн`
                    : selectedMainTag
                    ? `${selectedMainTag} Бүтээгдэхүүн`
                    : selectedTag
                    ? `${
                        selectedTag.name || selectedTag.title || selectedTag.tag
                      } Бүтээгдэхүүн`
                    : "Бүх Бүтээгдэхүүн"}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  {loading
                    ? "Ачааллаж байна..."
                    : `${products.length} бүтээгдэхүүн олдлоо`}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex-shrink-0">
                <ViewToggle
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
              </div>
            </div>

            <ProductGrid
              products={products}
              loading={loading}
              onProductClick={handleProductClick}
              viewMode={viewMode}
            />

            {/* Infinite Scroll Loading Indicator */}
            {!loading && hasMore && !selectedMainTag && !searchQuery && (
              <div ref={lastProductRef} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <svg
                      className="animate-spin h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-sm">Илүү ачаалж байна...</span>
                  </div>
                )}
              </div>
            )}

            {/* End of Results Message */}
            {!loading && !hasMore && products.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Бүх бүтээгдэхүүн харагдсан байна
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default HomePage;
