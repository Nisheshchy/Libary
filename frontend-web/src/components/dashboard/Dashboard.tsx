/** @format */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { booksAPI, borrowAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import "./Dashboard.css";

interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  overdueBooks: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    overdueBooks: 0,
  } as DashboardStats);
  const [recentBooks, setRecentBooks] = useState([] as any[]);
  const [myBorrows, setMyBorrows] = useState([] as any[]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load books
      const booksResponse = await booksAPI.getBooks({ limit: 6 });
      if (booksResponse.success && booksResponse.data) {
        setRecentBooks(booksResponse.data.books);
        
        // Calculate stats from books
        const books = booksResponse.data.books;
        const totalBooks = books.length;
        const availableBooks = books.filter((book: any) => book.available > 0).length;
        
        setStats(prev => ({
          ...prev,
          totalBooks,
          availableBooks,
        }));
      }

      // Load user's borrows if borrower
      if (user?.role === "borrower") {
        const borrowsResponse = await borrowAPI.getMyBorrows({ limit: 5 });
        if (borrowsResponse.success && borrowsResponse.data) {
          setMyBorrows(borrowsResponse.data.borrows);
          
          const borrows = borrowsResponse.data.borrows;
          const borrowedBooks = borrows.filter((borrow: any) => !borrow.returnDate).length;
          const overdueBooks = borrows.filter((borrow: any) => 
            !borrow.returnDate && new Date(borrow.dueDate) < new Date()
          ).length;
          
          setStats(prev => ({
            ...prev,
            borrowedBooks,
            overdueBooks,
          }));
        }
      }

      // Load stats for librarian
      if (user?.role === "librarian") {
        const statsResponse = await borrowAPI.getBorrowStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(prev => ({
            ...prev,
            ...statsResponse.data,
          }));
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name}! Here's what's happening in your library.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{stats.totalBooks}</h3>
            <p>Total Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.availableBooks}</h3>
            <p>Available Books</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-content">
            <h3>{stats.borrowedBooks}</h3>
            <p>{user?.role === "borrower" ? "My Borrowed" : "Total Borrowed"}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.overdueBooks}</h3>
            <p>Overdue Books</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Recent Books */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Books</h2>
            <Link to="/books" className="view-all-link">
              View All →
            </Link>
          </div>
          
          {recentBooks.length > 0 ? (
            <div className="books-grid">
              {recentBooks.slice(0, 6).map((book: any) => (
                <div key={book._id} className="book-card">
                  <div className="book-info">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <div className="book-meta">
                      <span className="book-available">
                        {book.available}/{book.quantity} available
                      </span>
                    </div>
                  </div>
                  <Link to={`/books/${book._id}`} className="book-link">
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No books available yet.</p>
              {user?.role === "librarian" && (
                <Link to="/books/new" className="add-book-link">
                  Add your first book
                </Link>
              )}
            </div>
          )}
        </div>

        {/* My Borrowed Books (for borrowers) */}
        {user?.role === "borrower" && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>My Borrowed Books</h2>
              <Link to="/my-books" className="view-all-link">
                View All →
              </Link>
            </div>
            
            {myBorrows.length > 0 ? (
              <div className="borrows-list">
                {myBorrows.slice(0, 5).map((borrow: any) => (
                  <div key={borrow._id} className="borrow-item">
                    <div className="borrow-info">
                      <h4>{borrow.bookId.title}</h4>
                      <p>by {borrow.bookId.author}</p>
                      <div className="borrow-dates">
                        <span>Due: {new Date(borrow.dueDate).toLocaleDateString()}</span>
                        {new Date(borrow.dueDate) < new Date() && !borrow.returnDate && (
                          <span className="overdue-badge">Overdue</span>
                        )}
                      </div>
                    </div>
                    <div className="borrow-status">
                      {borrow.returnDate ? (
                        <span className="status-returned">Returned</span>
                      ) : (
                        <span className="status-borrowed">Borrowed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't borrowed any books yet.</p>
                <Link to="/books" className="browse-books-link">
                  Browse available books
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/books" className="action-card">
              <div className="action-icon">🔍</div>
              <div className="action-content">
                <h3>Browse Books</h3>
                <p>Discover new books in our collection</p>
              </div>
            </Link>

            {user?.role === "librarian" && (
              <Link to="/books/new" className="action-card">
                <div className="action-icon">➕</div>
                <div className="action-content">
                  <h3>Add New Book</h3>
                  <p>Add a new book to the library</p>
                </div>
              </Link>
            )}

            <Link to="/profile" className="action-card">
              <div className="action-icon">👤</div>
              <div className="action-content">
                <h3>My Profile</h3>
                <p>Update your account information</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
