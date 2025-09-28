import React, {useState, useEffect} from "react";
import {Link} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {fetchUserProfile, updateUserProfile} from "../services/api";
import type {User} from "../types/index";
import PremiumUpgradeModal from "../components/PremiumUpgradeModal";

const ProfilePage: React.FC = () => {
  const {user: authUser, isAuthenticated} = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
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
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditForm({});
    } else {
      setIsEditing(true);
      setEditForm({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const updatedUser = await updateUserProfile(editForm);
      setUser(updatedUser);
      setIsEditing(false);
      setEditForm({});
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

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-electric-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {isEditing ? "Цуцлах" : "Профайл засах"}
              </button>
              {isEditing && (
                <button onClick={handleSaveProfile} className="btn-primary">
                  Өөрчлөлт хадгалах
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Профайлын мэдээлэл
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent"
                        placeholder="Нэрээ оруулна уу"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
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
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent"
                        placeholder="Овогоо оруулна уу"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
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
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent"
                      placeholder="И-мэйлээ оруулна уу"
                    />
                  ) : (
                    <p className="text-gray-900 dark:text-white">
                      {user.email || "Оруулаагүй"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Хэрэглэгчийн нэр
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    @{user.username}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Гишүүн болсон огноо
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(user.joinDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Status */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Премиум статус
              </h2>

              <div className="text-center">
                <div
                  className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    user.isPremium
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`text-3xl ${
                      user.isPremium
                        ? "text-white"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {user.isPremium ? "👑" : "⭐"}
                  </span>
                </div>

                <h3
                  className={`text-2xl font-bold mb-2 ${
                    user.isPremium
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {user.isPremium ? "Премиум гишүүн" : "Үнэгүй гишүүн"}
                </h3>

                {user.isPremium && user.premiumExpiryDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    Дуусах: {formatDate(user.premiumExpiryDate)}
                  </p>
                )}

                {!user.isPremium && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Онцгой онцлог шинж чанарууд болон давуу талын төлөө
                      премиум гишүүн болоорой!
                    </p>
                    <button
                      onClick={handleUpgradeToPremium}
                      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200"
                    >
                      Премиум гишүүн болох
                    </button>
                  </div>
                )}

                {user.isPremium && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                      Премиум давуу тал
                    </h4>
                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
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
