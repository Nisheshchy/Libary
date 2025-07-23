/** @format */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
// Update the import path below to match the actual location and filename of your Login component.
// For example, if the file is named 'login.tsx' or 'Login.tsx' in a different folder, update accordingly.
import Login from "./components/auth/Login"; // <-- Fix this path if needed
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
import BookList from "./components/books/BookList";
import BookDetails from "./components/books/BookDetails";
import BookForm from "./components/books/BookForm";
// import BorrowHistory from "./components/borrow/BorrowHistory";
import BorrowHistory from "./components/borrow/BorrowHistory"; // <-- Update this path if the file is named differently or in another folder, e.g. './components/borrowhistory/BorrowHistory', './components/borrowhistory/index', or './components/borrow/Borrowhistory'
import Profile from "./components/profile/Profile";
import About from "./components/pages/About";
import Contact from "./components/pages/Contact";
import Layout from "./components/layout/Layout";
import LoadingSpinner from "./components/common/LoadingSpinner";
import "./App.css";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: any; requiredRole?: string }> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: any }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="books" element={<BookList />} />
          <Route path="books/:id" element={<BookDetails />} />
          <Route
            path="books/new"
            element={
              <ProtectedRoute requiredRole="librarian">
                <BookForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="books/:id/edit"
            element={
              <ProtectedRoute requiredRole="librarian">
                <BookForm />
              </ProtectedRoute>
            }
          />
          <Route path="my-books" element={<BorrowHistory />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;
