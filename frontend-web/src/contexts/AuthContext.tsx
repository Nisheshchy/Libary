/** @format */

import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: "borrower" | "librarian";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE" }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "UPDATE_USER"; payload: User };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, email: string) => Promise<boolean>;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  isAuthenticated: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext(undefined as AuthContextType | undefined);

// Provider component
interface AuthProviderProps {
  children: any;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          dispatch({ type: "SET_LOADING", payload: true });
          const response = await authAPI.verifyToken();
          if (response.success && response.data) {
            dispatch({
              type: "LOGIN_SUCCESS",
              payload: {
                user: response.data.user,
                token,
              },
            });
          } else {
            localStorage.removeItem("token");
            dispatch({ type: "LOGIN_FAILURE" });
          }
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({ type: "LOGIN_FAILURE" });
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authAPI.login(email, password);

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return true;
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
        return false;
      }
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string = "borrower"
  ): Promise<boolean> => {
    try {
      dispatch({ type: "LOGIN_START" });
      const response = await authAPI.register(name, email, password, role);

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: {
            user: response.data.user,
            token: response.data.token,
          },
        });
        return true;
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
        return false;
      }
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
  };

  const updateProfile = async (
    name: string,
    email: string
  ): Promise<boolean> => {
    try {
      const response = await authAPI.updateProfile(name, email);
      if (response.success && response.data) {
        dispatch({ type: "UPDATE_USER", payload: response.data.user });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export type { User, AuthState };
