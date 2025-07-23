/** @format */

import axios, { AxiosResponse } from "axios";

// Base URL for API
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "borrower" | "librarian";
}

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  available: number;
  genre?: string;
  description?: string;
  publishedYear?: number;
  publisher?: string;
  language?: string;
  pages?: number;
  createdBy: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BorrowRecord {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  bookId: {
    _id: string;
    title: string;
    author: string;
    isbn: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: "borrowed" | "returned" | "overdue";
  renewalCount: number;
}

// Auth API
export const authAPI = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ user: User; token: string }>
      > = await api.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
        errors: error.response?.data?.errors,
      };
    }
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: string = "borrower"
  ): Promise<ApiResponse<{ user: User; token: string }>> => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ user: User; token: string }>
      > = await api.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
        errors: error.response?.data?.errors,
      };
    }
  },

  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> =
        await api.post("/auth/verify-token");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Token verification failed",
      };
    }
  },

  updateProfile: async (
    name: string,
    email: string
  ): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> =
        await api.put("/auth/profile", {
          name,
          email,
        });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
        errors: error.response?.data?.errors,
      };
    }
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Password change failed",
        errors: error.response?.data?.errors,
      };
    }
  },
};

// Books API
export const booksAPI = {
  getBooks: async (params?: {
    search?: string;
    genre?: string;
    author?: string;
    available?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<ApiResponse<{ books: Book[]; pagination: any }>> => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ books: Book[]; pagination: any }>
      > = await api.get("/books", {
        params,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch books",
      };
    }
  },

  getBook: async (id: string): Promise<ApiResponse<{ book: Book }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ book: Book }>> =
        await api.get(`/books/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch book",
      };
    }
  },

  createBook: async (
    bookData: Partial<Book>
  ): Promise<ApiResponse<{ book: Book }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ book: Book }>> =
        await api.post("/books", bookData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create book",
        errors: error.response?.data?.errors,
      };
    }
  },

  updateBook: async (
    id: string,
    bookData: Partial<Book>
  ): Promise<ApiResponse<{ book: Book }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ book: Book }>> =
        await api.put(`/books/${id}`, bookData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update book",
        errors: error.response?.data?.errors,
      };
    }
  },

  deleteBook: async (id: string): Promise<ApiResponse> => {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(
        `/books/${id}`
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete book",
      };
    }
  },

  getSearchSuggestions: async (
    query: string
  ): Promise<ApiResponse<{ suggestions: any[] }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ suggestions: any[] }>> =
        await api.get("/books/search/suggestions", {
          params: { q: query },
        });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch suggestions",
      };
    }
  },
};

// Borrow API
export const borrowAPI = {
  borrowBook: async (
    bookId: string
  ): Promise<ApiResponse<{ borrow: BorrowRecord }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ borrow: BorrowRecord }>> =
        await api.post("/borrow", {
          bookId,
        });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to borrow book",
      };
    }
  },

  returnBook: async (
    borrowId: string
  ): Promise<ApiResponse<{ borrow: BorrowRecord }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ borrow: BorrowRecord }>> =
        await api.post("/borrow/return", {
          borrowId,
        });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to return book",
      };
    }
  },

  renewBook: async (
    borrowId: string
  ): Promise<ApiResponse<{ borrow: BorrowRecord }>> => {
    try {
      const response: AxiosResponse<ApiResponse<{ borrow: BorrowRecord }>> =
        await api.post(`/borrow/${borrowId}/renew`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to renew book",
      };
    }
  },

  getMyBorrows: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ borrows: BorrowRecord[]; pagination: any }>> => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ borrows: BorrowRecord[]; pagination: any }>
      > = await api.get("/borrow/my-borrows", {
        params,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch borrow history",
      };
    }
  },

  getAllBorrowRecords: async (params?: {
    status?: string;
    userId?: string;
    bookId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ borrows: BorrowRecord[]; pagination: any }>> => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ borrows: BorrowRecord[]; pagination: any }>
      > = await api.get("/borrow/records", {
        params,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch borrow records",
      };
    }
  },

  getOverdueBooks: async (): Promise<
    ApiResponse<{ overdueBooks: BorrowRecord[]; count: number }>
  > => {
    try {
      const response: AxiosResponse<
        ApiResponse<{ overdueBooks: BorrowRecord[]; count: number }>
      > = await api.get("/borrow/overdue");
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch overdue books",
      };
    }
  },

  getBorrowStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await api.get(
        "/borrow/stats"
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to fetch borrow statistics",
      };
    }
  },
};

export type { ApiResponse, User, Book, BorrowRecord };
