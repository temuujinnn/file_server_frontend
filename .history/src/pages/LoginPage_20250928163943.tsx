import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {loginUser} from "../services/api";
import {setTokens, setUser} from "../services/auth";
import {useAuth} from "../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const {login} = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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

    try {
      const response = await loginUser(formData.username, formData.password);
      console.log("Login successful:", response);

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
          console.log("Extracted user data from token:", payload);

          const userData = {
            id: payload._id || payload.id,
            username: payload.username,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            isPremium: payload.isPremium || false,
            premiumExpiryDate: payload.premiumExpiryDate,
            joinDate: payload.joinDate,
            avatar: payload.avatar,
          };

          console.log("Setting user data:", userData);
          setUser(userData);
          login(userData); // Update AuthContext
        } catch (tokenError) {
          console.error("Error parsing token:", tokenError);
          // Fallback: try to get user data from response if available
          if (response.data.user) {
            console.log("Using user data from response:", response.data.user);
            setUser(response.data.user);
            login(response.data.user); // Update AuthContext
          }
        }

        // Redirect to home page
        navigate("/");
      } else {
        setError("Invalid response from server");
      }
    } catch (err) {
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as any).response;
        setError(response?.data?.message || "Login failed. Please try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div
            className="mx-auto h-12 w-12 bg-electric-blue-500 flex items-center justify-center"
            style={{borderRadius: "8px"}}
          >
            <span className="text-white font-bold text-xl">G</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to GameHub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-electric-blue-500 hover:text-electric-blue-400 transition-colors duration-200"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-electric-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/50 rounded-md">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              style={{borderRadius: "8px"}}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-colors duration-200"
            >
              ← Back to home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
