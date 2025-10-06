export interface Product {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  path?: string;
  mainTag?: string;
  additionalTags?: Tag[];
  gameImages?: string[];
  youtubeLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tag {
  _id?: string;
  name?: string;
  title?: string;
  tag?: string;
  category?: string;
  subTags?: Tag[];
  isExpanded?: boolean;
}

export interface Category {
  mainTagValue: string | null | undefined;
  id: string;
  name: string;
  icon?: string;
  tags: Tag[];
  isExpanded?: boolean;
  onclick?: () => void;
}

export interface User {
  _id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isSubscribed?: boolean;
  premiumExpiryDate?: string;
  createdAt?: string;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    refreshToken: string;
    accessToken: string;
    user: User;
    tokens: AuthTokens;
  };
  message?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
