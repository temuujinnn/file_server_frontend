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
      "/userAuth/profile"
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
    const response = await api.put<{success: boolean}>(
      "/userAuth/profile",
      userData
    );
    if (response.data.success) {
      // Since the update endpoint only returns success, we need to fetch the updated profile
      return await fetchUserProfile();
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
export const downloadProduct = async (productId: string): Promise<void> => {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://202.180.218.186:9000";
  const token = getAccessToken();

  if (!token) {
    console.error("No access token found for download");
    return;
  }

  try {
    // Step 1: request a download ticket/id
    const ticketResponse = await fetch(
      `${baseUrl}/user/game/download_link?id=${productId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!ticketResponse.ok) {
      throw new Error(
        `Failed to get download ticket (${ticketResponse.status})`
      );
    }

    const ticketJson = await ticketResponse.json();
    // Expected format: { success: true, data: "<ticketId>" }
    const ticketId: string | undefined = ticketJson?.data;
    if (!ticketJson?.success || !ticketId) {
      throw new Error("Invalid ticket response");
    }

    // Step 2: call the download_link endpoint with returned ticket id
    const downloadUrl = `${baseUrl}/user/game/download?id=${ticketId}`;

    const fileResponse = await fetch(downloadUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!fileResponse.ok) {
      throw new Error(`Download failed (${fileResponse.status})`);
    }

    const blob = await fileResponse.blob();

    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Error downloading product:", error);
    // Fallback to opening product id based download link if anything fails
    const fallbackUrl = `${baseUrl}/user/game/download_link?id=${productId}`;
    window.open(fallbackUrl, "_blank");
  }
};

export default api;
