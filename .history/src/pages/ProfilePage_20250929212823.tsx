import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {fetchUserProfile, updateUserProfile} from "../services/api";
import type {User} from "../types/index";
import PremiumUpgradeModal from "../components/PremiumUpgradeModal";

const ProfilePage: React.FC = () => {
  const {user: authUser, isAuthenticated, isLoading: authLoading} = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      // Wait for auth to finish determining state
      if (authLoading) return;

      if (!isAuthenticated) {
        setError("Профайлаа харахын тулд нэвтрэнэ үү");
        setLoading(false);
        return;
      }

      try {
        // First try to get user from auth context
        if (authUser) {
          setUser(authUser);
        }

        // Then try to fetch updated profile from API
        try {
          const profileData = await fetchUserProfile();
          setUser(profileData);
        } catch (apiError) {
          console.warn(
            "Could not fetch profile from API, using local data:",
            apiError
          );
        }
      } catch (err) {
        setError("Хэрэглэгчийн профайл ачаалахад алдаа гарлаа");
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [authLoading, isAuthenticated, authUser]);

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditForm({});
      setFormErrors({});
    } else {
      setIsEditing(true);
      setEditForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
      });
      setFormErrors({});
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name} = e.target;
    let {value} = e.target;

    // Sanitize and validate inputs
    if (name === "email") {
      // Remove any whitespace characters immediately
      value = value.replace(/\s+/g, "");
      setFormErrors((prev) => ({...prev, email: undefined}));
    }

    if (name === "phone") {
      // Keep digits only and limit to 8
      value = value.replace(/\D+/g, "").slice(0, 8);
      const phoneError =
        value.length === 0 || value.length === 8
          ? undefined
          : "Утасны дугаар 8 оронтой байх ёстой";
      setFormErrors((prev) => ({...prev, phone: phoneError}));
    }

    setEditForm((prev) => ({...prev, [name]: value}));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    // Final validation before save
    const nextErrors: {email?: string; phone?: string} = {};
    const email = (editForm.email ?? "").toString();
    const phone = (editForm.phone ?? "").toString();

    if (/\s/.test(email)) {
      nextErrors.email = "И-мэйл завсаргүй бичнэ үү";
    }
    if (phone.length !== 8 || /\D/.test(phone)) {
      nextErrors.phone = "Утасны дугаар зөвхөн 8 цифр байх ёстой";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    try {
      const updatedUser = await updateUserProfile(editForm);
      setUser(updatedUser);
      setIsEditing(false);
      setEditForm({});
      setFormErrors({});
    } catch (err) {
      setError("Профайл шинэчлэхэд алдаа гарлаа");
      console.error("Error updating profile:", err);
    }
  };

  const handleUpgradeToPremium = () => {
    setShowPremiumModal(true);
  };

  const handlePremiumUpgradeSuccess = (updatedUser: User) => {
    setUser(updatedUser);
    setShowPremiumModal(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Профайл ачааллаж байна...
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || "Профайл олдсонгүй"}
          </h1>
          <Link to="/login" className="btn-primary">
            Нэвтрэх хуудас руу очих
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-electric-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg sm:text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleEditToggle}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base"
              >
                {isEditing ? "Цуцлах" : "Профайл засах"}
              </button>
              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  className="w-full sm:w-auto btn-primary text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !!formErrors.email ||
                    !!formErrors.phone ||
                    (editForm.phone
                      ? (editForm.phone as string).length !== 8
                      : true)
                  }
                >
                  Өөрчлөлт хадгалах
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Профайлын мэдээлэл
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Нэр
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={editForm.firstName || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Нэрээ оруулна уу"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                        {user.firstName || "Оруулаагүй"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Овог
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={editForm.lastName || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Овогоо оруулна уу"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                        {user.lastName || "Оруулаагүй"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    И-мэйл
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editForm.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="И-мэйлээ оруулна уу"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white break-all">
                      {user.email || "Оруулаагүй"}
                    </p>
                  )}
                  {isEditing && formErrors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Утасны дугаар
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Утасны дугаараа оруулна уу"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                      {user.phone || "Оруулаагүй"}
                    </p>
                  )}
                  {isEditing && formErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Хэрэглэгчийн нэр
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    @{user.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Гишүүн болсон огноо
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 dark:text-white">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Status */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Премиум статус
              </h2>

              <div className="text-center">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    user.isSubscribed
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`text-2xl sm:text-3xl ${
                      user.isSubscribed
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {user.isSubscribed ? "👑" : "⭐"}
                  </span>
                </div>

                <h3
                  className={`text-lg sm:text-xl lg:text-2xl font-bold mb-2 ${
                    user.isSubscribed
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {user.isSubscribed ? "Премиум гишүүн" : "Үнэгүй гишүүн"}
                </h3>

                {user.isSubscribed && user.premiumExpiryDate && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Дуусах: {formatDate(user.premiumExpiryDate)}
                  </p>
                )}

                {!user.isSubscribed && (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      Онцгой онцлог шинж чанарууд болон давуу талын төлөө
                      премиум гишүүн болоорой!
                    </p>
                    <button
                      onClick={handleUpgradeToPremium}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 text-sm sm:text-base"
                    >
                      Премиум гишүүн болох
                    </button>
                  </div>
                )}

                {user.isSubscribed && (
                  <div className="mt-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 text-sm sm:text-base">
                      Премиум давуу тал
                    </h4>
                    <ul className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                      <li>• Хязгааргүй татаж авах</li>
                      <li>• Урьдчилсан тусламж</li>
                      <li>• Шинэ тоглоомуудад эрт хандалт</li>
                      <li>• Зар сурталчилгаагүй туршлага</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgradeSuccess={handlePremiumUpgradeSuccess}
      />
    </div>
  );
};

export default ProfilePage;
