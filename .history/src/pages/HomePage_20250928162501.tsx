import React, {useState, useEffect} from "react";
import TagSidebar from "../components/TagSidebar";
import ProductGrid from "../components/ProductGrid";
import ProductDetailModal from "../components/ProductDetailModal";
import ViewToggle from "../components/ViewToggle";
import {fetchAllProducts, fetchProductsByTag} from "../services/api";
import type {Product, Tag} from "../types/index";
import type {ViewMode} from "../components/ViewToggle";

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [selectedMainTag, setSelectedMainTag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Load all products on initial page load
  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const productsData = await fetchAllProducts();
      setProducts(productsData);
    } catch (err) {
      setError("Бүтээгдэхүүн ачаалахад алдаа гарлаа");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSelect = async (tag: Tag | null) => {
    setSelectedTag(tag);

    try {
      setLoading(true);
      setError(null);

      if (tag === null) {
        // Load all products
        await loadAllProducts();
      } else {
        // Load products filtered by tag
        const tagId = tag.id ?? tag._id;
        if (!tagId) {
          throw new Error("Тегийн ID байхгүй байна");
        }
        const filteredProducts = await fetchProductsByTag(tagId);
        setProducts(filteredProducts);
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

    try {
      setLoading(true);
      setError(null);

      if (mainTag === null) {
        // Load all products
        await loadAllProducts();
      } else {
        // Filter products by mainTag on the client side
        const allProducts = await fetchAllProducts();
        const filteredProducts = allProducts.filter(
          (product) => product.mainTag === mainTag
        );
        setProducts(filteredProducts);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Бүх тоглоом болон програм-г нэг дороос
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Та нэг удаа төлөөд бүх тоглоом болон програмыг татаж авах боломжтой.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <TagSidebar
              onTagSelect={handleTagSelect}
              selectedTag={selectedTag}
              onMainTagSelect={handleMainTagSelect}
              selectedMainTag={selectedMainTag}
              products={products}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={loadAllProducts}
                  className="mt-2 text-sm text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 underline"
                >
                  Дахин оролдох
                </button>
              </div>
            )}

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedMainTag
                    ? `${selectedMainTag} Бүтээгдэхүүн`
                    : selectedTag
                    ? `${
                        selectedTag.name || selectedTag.title || selectedTag.tag
                      } Бүтээгдэхүүн`
                    : "Бүх Бүтээгдэхүүн"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {loading
                    ? "Ачааллаж байна..."
                    : `${products.length} бүтээгдэхүүн олдлоо`}
                </p>
              </div>

              {/* View Toggle */}
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            </div>

            <ProductGrid
              products={products}
              loading={loading}
              onProductClick={handleProductClick}
              viewMode={viewMode}
            />
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
