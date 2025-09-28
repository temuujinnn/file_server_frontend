/// <reference types="vite/client" />
import axios from "axios";
import type {Product, Tag, AuthResponse, User} from "../types/index";
import {getAccessToken, clearTokens} from "./auth";

// Configure axios with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://202.180.218.186:9000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Add request interceptor for debugging and authentication
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to: ${config.url}`
    );

    // Add authentication header if token exists
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging and token management
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    console.error(`Error from ${error.config?.url}:`, error);

    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      console.log("Unauthorized access - clearing tokens");
      clearTokens();
      // Redirect to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// API functions for products and tags
export const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    console.log("Fetching all products...");
    const response = await api.get<{success: boolean; data: Product[]}>(
      "/user/game/all"
    );
    console.log("Products response:", response.data);
    // Handle the nested data structure
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log("Products data:", response.data.data);
      return response.data.data;
    }
    console.log("No products found or invalid response structure");
    return [];
  } catch (error) {
    console.error("Error fetching all products:", error);
    return []; // Return empty array on error
  }
};

export const fetchGames = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>("/user/game/games");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching games:", error);
    return [];
  }
};

export const fetchSoftware = async (): Promise<Product[]> => {
  try {
    const response = await api.get<Product[]>("/user/game/software");
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching software:", error);
    return [];
  }
};

export const fetchAdditionalTags = async (): Promise<Tag[]> => {
  try {
    console.log("Fetching additional tags...");
    const response = await api.get<{success: boolean; data: Tag[]}>(
      "/user/game/additional_tags"
    );
    console.log("Tags response:", response.data);
    // Handle the nested data structure
    if (response.data.success && Array.isArray(response.data.data)) {
      console.log("Tags data:", response.data.data);
      return response.data.data;
    }
    console.log("No tags found or invalid response structure");
    return [];
  } catch (error) {
    console.error("Error fetching additional tags:", error);
    return []; // Return empty array on error
  }
};

export const fetchProductsByTag = async (tagId: string): Promise<Product[]> => {
  try {
    const response = await api.get<{success: boolean; data: Product[]}>(
      `/user/game/games/additional_tag?additionalTag=${tagId}`
    );
    // Handle the nested data structure
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching products by tag:", error);
    return []; // Return empty array on error
  }
};

// API functions for authentication
export const registerUser = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/userAuth/register", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/userAuth/login", {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

// User profile functions
export const fetchUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get<{success: boolean; data: User}>(
      "/user/profile"
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error("Хэрэглэгчийн профайл ачаалахад алдаа гарлаа");
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userData: Partial<User>
): Promise<User> => {
  try {
    const response = await api.put<{success: boolean; data: User}>(
      "/user/profile",
      userData
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error("Хэрэглэгчийн профайл шинэчлэхэд алдаа гарлаа");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const upgradeToPremium = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.post<{success: boolean; message: string}>(
      "/user/premium/upgrade"
    );
    return response.data;
  } catch (error) {
    console.error("Error upgrading to premium:", error);
    throw error;
  }
};

// Download function
export const downloadProduct = (productId: string): void => {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://202.180.218.186:9000";
  const downloadUrl = `${baseUrl}/user/game/download?id=${productId}`;
  window.open(downloadUrl, "_blank");
};

export default api;
