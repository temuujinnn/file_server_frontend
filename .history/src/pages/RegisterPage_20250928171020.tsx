import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {registerUser} from "../services/api";
import {setTokens, setUser} from "../services/auth";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Нууц үг дор хаяж 6 тэмдэгт урт байх ёстой");
      setLoading(false);
      return;
    }

    try {
      const response = await registerUser(formData.username, formData.password);
      console.log("Registration successful:", response);

      if (response.success && response.data) {
        // Store tokens
        setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        // Store user info (extract from JWT token)
        try {
          const payload = JSON.parse(
            atob(response.data.accessToken.split(".")[1])
          );
          setUser({
            id: payload._id,
            username: payload.username,
          });
        } catch (tokenError) {
          console.error("Error parsing token:", tokenError);
        }

        // Redirect to home page
        navigate("/");
      } else {
        setError("Серверээс буруу хариу ирлээ");
      }
    } catch (err) {
      if (err && typeof err === "object" && "response" in err) {
        const errorObj = err as {response?: {data?: {message?: string}}};
        setError(
          errorObj.response?.data?.message ||
            "Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу."
        );
      } else {
        setError("Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div>
          <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 bg-electric-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-xl">G</span>
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Natsag.mnд бүртгэл үүсгэх
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Эсвэл{" "}
            <Link
              to="/login"
              className="font-medium text-electric-blue-500 hover:text-electric-blue-400 transition-colors duration-200"
            >
              одоо байгаа бүртгэлдээ нэвтрэх
            </Link>
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Хэрэглэгчийн нэр
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Хэрэглэгчийн нэр сонгоно уу"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Нууц үг
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Нууц үг үүсгэнэ үү"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Нууц үг баталгаажуулах
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Нууц үгээ баталгаажуулна уу"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-lg">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-2 sm:py-3 text-sm sm:text-base rounded-lg"
            >
              {loading ? "Бүртгэл үүсгэж байна..." : "Бүртгэл үүсгэх"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors duration-200"
            >
              ← Нүүр хуудас руу буцах
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
