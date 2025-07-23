/** @format */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { booksAPI } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import "./Books.css";

interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  available: number;
  quantity: number;
  genre?: string;
  publisher?: string;
  publishedYear?: number;
  language?: string;
  pages?: number;
  description?: string;
}

const BookList = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBooks();
  }, [currentPage, searchTerm]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBooks({
        search: searchTerm,
        page: currentPage,
        limit: 12,
      });

      if (response.success && response.data) {
        setBooks(response.data.books);
      } else {
        setError("Failed to load books");
      }
    } catch (err) {
      setError("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setCurrentPage(1);
    loadBooks();
  };

  if (loading) {
    return <LoadingSpinner message="Loading books..." />;
  }

  return (
    <div className="book-list">
      <div className="book-list-header">
        <h1>Browse Books</h1>
        <p>Discover and borrow books from our collection</p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍 Search
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="books-grid">
        {books.length > 0 ? (
          books.map((book: Book) => (
            <div key={book._id} className="book-card">
              <div className="book-info">
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">by {book.author}</p>
                <div className="book-meta">
                  <span className="book-isbn">ISBN: {book.isbn}</span>
                  <span
                    className={`book-availability ${
                      book.available > 0 ? "available" : "unavailable"
                    }`}>
                    {book.available > 0
                      ? `${book.available} available`
                      : "Not available"}
                  </span>
                </div>
              </div>
              <div className="book-actions">
                <Link to={`/books/${book._id}`} className="btn btn-primary">
                  View Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No books found.</p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="btn btn-secondary">
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
