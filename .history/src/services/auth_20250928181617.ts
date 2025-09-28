import type {AuthTokens, User} from "../types/index";

const ACCESS_TOKEN_KEY = "gamehub_access_token";
const REFRESH_TOKEN_KEY = "gamehub_refresh_token";
const USER_KEY = "gamehub_user";

// Token management functions
export const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  console.log("Checking authentication - token exists:", !!token);

  if (!token) {
    console.log("No access token found");
    return false;
  }

  try {
    // Check if token is expired
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("Invalid token format - not a valid JWT");
      return false;
    }

    const payload = JSON.parse(atob(parts[1]));
    console.log("Token payload:", payload);

    const currentTime = Date.now() / 1000;
    const isExpired = payload.exp <= currentTime;

    console.log("Token expiration check:", {
      exp: payload.exp,
      currentTime,
      isExpired,
      isValid: !isExpired,
    });

    return !isExpired;
  } catch (error) {
    console.error("Error parsing token:", error);
    return false;
  }
};

// User management functions
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  console.log("Getting user from localStorage:", !!userStr);

  if (!userStr) {
    console.log("No user data found in localStorage");
    return null;
  }

  try {
    const user = JSON.parse(userStr);
    console.log("Parsed user data:", user);
    return user;
  } catch (error) {
    console.error("Error parsing user data:", error);
    return null;
  }
};

export const clearUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// Debug function to check authentication status
export const debugAuthStatus = (): void => {
  const token = getAccessToken();
  const user = getUser();

  console.log("=== AUTH DEBUG INFO ===");
  console.log("Access token exists:", !!token);
  console.log("User data exists:", !!user);
  console.log("Is authenticated:", isAuthenticated());

  if (token) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log("Token payload:", payload);
        console.log("Token expires at:", new Date(payload.exp * 1000));
        console.log("Current time:", new Date());
        console.log("Token is expired:", payload.exp <= Date.now() / 1000);
      }
    } catch (error) {
      console.error("Error parsing token for debug:", error);
    }
  }

  if (user) {
    console.log("User data:", user);
    console.log("User is subscribed:", user.isSubscribed);
  }
  console.log("=== END AUTH DEBUG ===");
};

// Logout function
export const logout = (): void => {
  clearTokens();
  clearUser();
  window.location.href = "/";
};
