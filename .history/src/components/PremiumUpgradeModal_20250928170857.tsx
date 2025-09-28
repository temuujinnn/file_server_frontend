import React, {useState} from "react";
import {upgradeToPremium, fetchUserProfile} from "../services/api";

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: (user: any) => void;
}

const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgradeSuccess,
}) => {
  const [upgrading, setUpgrading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "online">("bank");

  const bankAccountInfo = {
    bankName: "Хаан Банк",
    accountNumber: "1234567890",
    accountName: "File Server Premium",
    swiftCode: "KHANMNUB",
    amount: "₮50,000",
    currency: "MNT",
  };

  const handleUpgradeToPremium = async () => {
    setUpgrading(true);
    try {
      const result = await upgradeToPremium();
      if (result.success) {
        // Refresh user profile to get updated premium status
        const updatedProfile = await fetchUserProfile();
        onUpgradeSuccess(updatedProfile);
        alert("Амжилттай премиум гишүүн боллоо! Төлбөрөө хийгээрэй.");
        onClose();
      } else {
        alert("Премиум гишүүн болох амжилтгүй боллоо. Дахин оролдоно уу.");
      }
    } catch (err) {
      alert("Премиум гишүүн болох үед алдаа гарлаа. Дахин оролдоно уу.");
      console.error("Error upgrading to premium:", err);
    } finally {
      setUpgrading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Самбарт хуулагдлаа!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl sm:text-2xl">👑</span>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                  Премиум гишүүн болох
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  Премиум онцлог шинж чанаруудад онцгой хандалт авах
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
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

          {/* Premium Benefits */}
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
              Премиум давуу тал
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Хязгааргүй татаж авах</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Урьдчилсан тусламж</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Шинэ тоглоомуудад эрт хандалт</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-500">✓</span>
                <span>Зар сурталчилгаагүй туршлага</span>
              </li>
            </ul>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Төлбөрийн арга сонгох
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={() => setPaymentMethod("bank")}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === "bank"
                    ? "border-electric-blue-500 bg-electric-blue-50 dark:bg-electric-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-2">🏦</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    Банк шилжүүлэг
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Гар төлбөр
                  </div>
                </div>
              </button>
              <button
                onClick={() => setPaymentMethod("online")}
                className={`p-3 sm:p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === "online"
                    ? "border-electric-blue-500 bg-electric-blue-50 dark:bg-electric-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-xl sm:text-2xl mb-2">💳</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    Онлайн төлбөр
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                    Удахгүй
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Bank Account Information */}
          {paymentMethod === "bank" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Банк шилжүүлгийн мэдээлэл
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Дүн:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400 text-lg">
                    {bankAccountInfo.amount} {bankAccountInfo.currency}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Банкны нэр:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {bankAccountInfo.bankName}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(bankAccountInfo.bankName)
                        }
                        className="text-electric-blue-500 hover:text-electric-blue-600 transition-colors"
                        title="Самбарт хуулах"
                      >
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Дансны дугаар:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {bankAccountInfo.accountNumber}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(bankAccountInfo.accountNumber)
                        }
                        className="text-electric-blue-500 hover:text-electric-blue-600 transition-colors"
                        title="Самбарт хуулах"
                      >
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      Дансны нэр:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {bankAccountInfo.accountName}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(bankAccountInfo.accountName)
                        }
                        className="text-electric-blue-500 hover:text-electric-blue-600 transition-colors"
                        title="Самбарт хуулах"
                      >
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-300">
                      SWIFT код:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {bankAccountInfo.swiftCode}
                      </span>
                      <button
                        onClick={() =>
                          copyToClipboard(bankAccountInfo.swiftCode)
                        }
                        className="text-electric-blue-500 hover:text-electric-blue-600 transition-colors"
                        title="Самбарт хуулах"
                      >
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
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">Чухал зааварчилгаа:</p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • Яг энэ дүнг шилжүүлнэ үү:{" "}
                        <strong>
                          {bankAccountInfo.amount} {bankAccountInfo.currency}
                        </strong>
                      </li>
                      <li>
                        • Шилжүүлгийн тайлбарт хэрэглэгчийн нэрээ бичнэ үү
                      </li>
                      <li>• Премиум хандалт 24 цагийн дотор идэвхжүүлэгдэнэ</li>
                      <li>• Асуулт байвал тусламжтайгаа холбоо барина уу</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Online Payment (Coming Soon) */}
          {paymentMethod === "online" && (
            <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Онлайн төлбөр
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Онлайн төлбөрийн интеграци удахгүй ирнэ. Одоогоор банк шилжүүлэг
                ашиглана уу.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Цуцлах
            </button>
            <button
              onClick={handleUpgradeToPremium}
              disabled={upgrading || paymentMethod === "online"}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {upgrading ? "Боловсруулж байна..." : "Баталгаажуулах & Төлөх"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumUpgradeModal;
